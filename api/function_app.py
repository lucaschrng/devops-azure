import azure.functions as func
import datetime
import json
import logging
import uuid
import os
import bcrypt
from azure.cosmos import CosmosClient, PartitionKey, exceptions

app = func.FunctionApp()

# Configuration Cosmos DB
COSMOS_URL = os.environ.get('COSMOS_URL', '')
COSMOS_KEY = os.environ.get('COSMOS_KEY', '')
DATABASE_NAME = 'BayrouMeterDB'
USERS_CONTAINER = 'users'
VOTES_CONTAINER = 'votes'

def get_cosmos_client():
    """Initialise le client Cosmos DB"""
    return CosmosClient(COSMOS_URL, COSMOS_KEY)

def get_database(client):
    """Récupère ou crée la base de données"""
    try:
        return client.get_database_client(DATABASE_NAME)
    except exceptions.CosmosResourceNotFoundError:
        return client.create_database(DATABASE_NAME)

def get_container(database, container_name, partition_key_path):
    """Récupère ou crée un container"""
    try:
        return database.get_container_client(container_name)
    except exceptions.CosmosResourceNotFoundError:
        return database.create_container(
            id=container_name,
            partition_key=PartitionKey(path=partition_key_path)
        )

@app.route(route="user", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def createUser(req: func.HttpRequest) -> func.HttpResponse:
    """Endpoint POST /user pour créer un utilisateur (pseudo + email + password)"""
    logging.info('Processing POST /user request')

    try:
        # Récupérer les données JSON de la requête
        req_body = req.get_json()
        if not req_body:
            return func.HttpResponse(
                json.dumps({"error": "Request body is required"}),
                mimetype="application/json",
                status_code=400
            )

        pseudo = req_body.get('pseudo')
        email = req_body.get('email')
        password = req_body.get('password')

        if not pseudo or not email or not password:
            return func.HttpResponse(
                json.dumps({"error": "Pseudo, email and password are required"}),
                mimetype="application/json",
                status_code=400
            )

        # Initialiser Cosmos DB
        client = get_cosmos_client()
        database = get_database(client)
        users_container = get_container(database, USERS_CONTAINER, "/id")

        # Hash du mot de passe
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt)

        # Créer l'utilisateur
        user_id = str(uuid.uuid4())
        user_doc = {
            "id": user_id,
            "pseudo": pseudo,
            "email": email,
            "password_hash": hashed_password.decode('utf-8'),
            "created_at": datetime.datetime.utcnow().isoformat()
        }

        # Vérifier si l'email existe déjà
        query = f"SELECT * FROM c WHERE c.email = '{email}'"
        existing_users = list(users_container.query_items(query=query, enable_cross_partition_query=True))
        
        if existing_users:
            return func.HttpResponse(
                json.dumps({"error": "Email already exists"}),
                mimetype="application/json",
                status_code=409
            )

        # Insérer l'utilisateur
        users_container.create_item(body=user_doc)

        return func.HttpResponse(
            json.dumps({
                "status": "success",
                "user": {
                    "id": user_id,
                    "pseudo": pseudo,
                    "email": email
                }
            }),
            mimetype="application/json",
            status_code=201
        )

    except Exception as e:
        logging.error(f"Error creating user: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            mimetype="application/json",
            status_code=500
        )

@app.route(route="vote", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def submitVote(req: func.HttpRequest) -> func.HttpResponse:
    """Endpoint POST /vote pour exprimer un choix (Oui ou Non)"""
    logging.info('Processing POST /vote request')

    try:
        # Récupérer les données JSON de la requête
        req_body = req.get_json()
        if not req_body:
            return func.HttpResponse(
                json.dumps({"error": "Request body is required"}),
                mimetype="application/json",
                status_code=400
            )

        user_id = req_body.get('user_id')
        choice = req_body.get('choice')  # "oui" ou "non"

        if not user_id or not choice:
            return func.HttpResponse(
                json.dumps({"error": "Both user_id and choice are required"}),
                mimetype="application/json",
                status_code=400
            )

        if choice.lower() not in ['oui', 'non']:
            return func.HttpResponse(
                json.dumps({"error": "Choice must be 'oui' or 'non'"}),
                mimetype="application/json",
                status_code=400
            )

        # Initialiser Cosmos DB
        client = get_cosmos_client()
        database = get_database(client)
        users_container = get_container(database, USERS_CONTAINER, "/id")
        votes_container = get_container(database, VOTES_CONTAINER, "/user_id")

        # Vérifier que l'utilisateur existe
        try:
            users_container.read_item(item=user_id, partition_key=user_id)
        except exceptions.CosmosResourceNotFoundError:
            return func.HttpResponse(
                json.dumps({"error": "User not found"}),
                mimetype="application/json",
                status_code=404
            )

        # Vérifier si l'utilisateur a déjà voté
        query = f"SELECT * FROM c WHERE c.user_id = '{user_id}'"
        existing_votes = list(votes_container.query_items(query=query, enable_cross_partition_query=True))
        
        if existing_votes:
            return func.HttpResponse(
                json.dumps({"error": "User has already voted"}),
                mimetype="application/json",
                status_code=409
            )

        # Créer le vote
        vote_id = str(uuid.uuid4())
        vote_doc = {
            "id": vote_id,
            "user_id": user_id,
            "choice": choice.lower(),
            "question": "Est-ce que François Bayrou nous manque ?",
            "created_at": datetime.datetime.utcnow().isoformat()
        }

        # Insérer le vote
        votes_container.create_item(body=vote_doc)

        return func.HttpResponse(
            json.dumps({
                "status": "success",
                "vote": {
                    "id": vote_id,
                    "user_id": user_id,
                    "choice": choice.lower(),
                    "question": "Est-ce que François Bayrou nous manque ?"
                }
            }),
            mimetype="application/json",
            status_code=201
        )

    except Exception as e:
        logging.error(f"Error submitting vote: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            mimetype="application/json",
            status_code=500
        )

@app.route(route="votes", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
def getVotes(req: func.HttpRequest) -> func.HttpResponse:
    """Endpoint GET /votes retournant la liste des votes avec stats"""
    logging.info('Processing GET /votes request')

    try:
        # Initialiser Cosmos DB
        client = get_cosmos_client()
        database = get_database(client)
        votes_container = get_container(database, VOTES_CONTAINER, "/user_id")
        users_container = get_container(database, USERS_CONTAINER, "/id")

        # Récupérer tous les votes
        votes_query = "SELECT * FROM c ORDER BY c.created_at DESC"
        votes = list(votes_container.query_items(query=votes_query, enable_cross_partition_query=True))

        # Enrichir les votes avec les informations utilisateur
        enriched_votes = []
        stats = {"oui": 0, "non": 0, "total": 0}

        for vote in votes:
            try:
                # Récupérer les infos utilisateur
                user = users_container.read_item(item=vote['user_id'], partition_key=vote['user_id'])
                
                enriched_vote = {
                    "id": vote['id'],
                    "user": {
                        "id": vote['user_id'],
                        "pseudo": user['pseudo']
                    },
                    "choice": vote['choice'],
                    "question": vote['question'],
                    "created_at": vote['created_at']
                }
                enriched_votes.append(enriched_vote)
                
                # Calculer les stats
                if vote['choice'] == 'oui':
                    stats["oui"] += 1
                elif vote['choice'] == 'non':
                    stats["non"] += 1
                stats["total"] += 1
                
            except exceptions.CosmosResourceNotFoundError:
                # Si l'utilisateur n'existe plus, on garde le vote mais sans les infos utilisateur
                enriched_vote = {
                    "id": vote['id'],
                    "user": {
                        "id": vote['user_id'],
                        "pseudo": "Utilisateur supprimé"
                    },
                    "choice": vote['choice'],
                    "question": vote['question'],
                    "created_at": vote['created_at']
                }
                enriched_votes.append(enriched_vote)
                stats["total"] += 1

        # Calculer les pourcentages
        if stats["total"] > 0:
            stats["oui_percentage"] = round((stats["oui"] / stats["total"]) * 100, 1)
            stats["non_percentage"] = round((stats["non"] / stats["total"]) * 100, 1)
        else:
            stats["oui_percentage"] = 0
            stats["non_percentage"] = 0

        return func.HttpResponse(
            json.dumps({
                "votes": enriched_votes,
                "stats": stats,
                "question": "Est-ce que François Bayrou nous manque ?"
            }),
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:
        logging.error(f"Error getting votes: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            mimetype="application/json",
            status_code=500
        )

@app.route(route="login", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def loginUser(req: func.HttpRequest) -> func.HttpResponse:
    """Endpoint POST /login pour connecter un utilisateur existant"""
    logging.info('Processing POST /login request')

    try:
        # Récupérer les données JSON de la requête
        req_body = req.get_json()
        if not req_body:
            return func.HttpResponse(
                json.dumps({"error": "Request body is required"}),
                mimetype="application/json",
                status_code=400
            )

        email = req_body.get('email')
        password = req_body.get('password')

        if not email or not password:
            return func.HttpResponse(
                json.dumps({"error": "Email and password are required"}),
                mimetype="application/json",
                status_code=400
            )

        # Initialiser Cosmos DB
        client = get_cosmos_client()
        database = get_database(client)
        users_container = get_container(database, USERS_CONTAINER, "/id")

        # Chercher l'utilisateur par email
        query = f"SELECT * FROM c WHERE c.email = '{email}'"
        users = list(users_container.query_items(query=query, enable_cross_partition_query=True))
        
        if not users:
            return func.HttpResponse(
                json.dumps({"error": "Invalid email or password"}),
                mimetype="application/json",
                status_code=401
            )

        user = users[0]  # Premier utilisateur trouvé
        
        # Vérifier le mot de passe
        stored_password_hash = user.get('password_hash')
        
        if not stored_password_hash:
            return func.HttpResponse(
                json.dumps({"error": "Invalid email or password"}),
                mimetype="application/json",
                status_code=401
            )
        
        # Vérifier le mot de passe
        if not bcrypt.checkpw(password.encode('utf-8'), stored_password_hash.encode('utf-8')):
            return func.HttpResponse(
                json.dumps({"error": "Invalid email or password"}),
                mimetype="application/json",
                status_code=401
            )

        return func.HttpResponse(
            json.dumps({
                "status": "success",
                "user": {
                    "id": user['id'],
                    "pseudo": user['pseudo'],
                    "email": user['email']
                }
            }),
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:
        logging.error(f"Error logging in user: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            mimetype="application/json",
            status_code=500
        )