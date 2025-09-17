# Bayrou Meter API - Azure Functions

Cette API Azure Functions implémente le backend pour l'application "Bayrou Meter" qui permet aux utilisateurs de voter sur la question : "Est-ce que François Bayrou nous manque ?"

## Fonctionnalités

### Endpoints disponibles

1. **POST /api/user** - Créer un utilisateur
   - Body: `{"pseudo": "string", "email": "string"}`
   - Retourne: `{"status": "success", "user": {"id": "uuid", "pseudo": "string", "email": "string"}}`

2. **POST /api/vote** - Soumettre un vote
   - Body: `{"user_id": "uuid", "choice": "oui|non"}`
   - Retourne: `{"status": "success", "vote": {...}}`

3. **GET /api/votes** - Récupérer tous les votes avec statistiques
   - Retourne: `{"votes": [...], "stats": {"oui": 0, "non": 0, "total": 0, "oui_percentage": 0, "non_percentage": 0}}`

## Configuration

### Prérequis

1. **Azure Functions Core Tools** installé
   ```bash
   npm i -g azure-functions-core-tools@4 --unsafe-perm true
   ```

2. **Python 3.10+** installé

3. **Compte Azure Cosmos DB** configuré

### Installation

1. Cloner le projet et aller dans le dossier API
   ```bash
   cd bayrou-meter-api
   ```

2. Installer les dépendances Python
   ```bash
   pip install -r requirements.txt
   ```

3. Configurer les variables d'environnement
   ```bash
   cp local.settings.example.json local.settings.json
   ```

4. Éditer `local.settings.json` avec vos vraies valeurs Cosmos DB :
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "UseDevelopmentStorage=true",
       "FUNCTIONS_WORKER_RUNTIME": "python",
       "COSMOS_URL": "https://votre-compte-cosmos.documents.azure.com:443/",
       "COSMOS_KEY": "votre-clé-primaire-cosmos-ici"
     }
   }
   ```

### Création des ressources Azure

#### 1. Créer un compte Cosmos DB

```bash
# Remplacez <votre-login> par votre identifiant unique
az cosmosdb create \
  --name bayroudb<votre-login> \
  --resource-group BayrouMeterRG \
  --kind GlobalDocumentDB \
  --locations regionName=francecentral failoverPriority=0 isZoneRedundant=False
```

#### 2. Récupérer l'URL et la clé

```bash
# URL Cosmos DB
az cosmosdb show \
  --name bayroudb<votre-login> \
  --resource-group BayrouMeterRG \
  --query documentEndpoint \
  --output tsv

# Clé primaire
az cosmosdb keys list \
  --name bayroudb<votre-login> \
  --resource-group BayrouMeterRG \
  --query primaryMasterKey \
  --output tsv
```

### Lancement en local

```bash
func start
```

L'API sera disponible sur `http://localhost:7071/api/`

### Test des endpoints

#### Créer un utilisateur
```bash
curl -X POST http://localhost:7071/api/user \
  -H "Content-Type: application/json" \
  -d '{"pseudo": "test_user", "email": "test@example.com"}'
```

#### Soumettre un vote
```bash
curl -X POST http://localhost:7071/api/vote \
  -H "Content-Type: application/json" \
  -d '{"user_id": "uuid-retourné-par-creation-user", "choice": "oui"}'
```

#### Récupérer les votes
```bash
curl http://localhost:7071/api/votes
```

## Structure Cosmos DB

L'application utilise une base de données `BayrouMeterDB` avec deux collections :

- **users** : Stocke les utilisateurs (partition key: `/id`)
- **votes** : Stocke les votes (partition key: `/user_id`)

Les collections sont créées automatiquement au premier appel de l'API.

## Déploiement

Pour déployer sur Azure :

1. Créer une Function App
2. Configurer les variables d'environnement dans Azure
3. Publier avec `func azure functionapp publish <nom-function-app>`
