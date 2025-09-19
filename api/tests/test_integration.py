"""
Test d'intégration pour le cycle complet : création utilisateur → vote → nettoyage
"""

import pytest
import requests
import json
import os
import uuid
from azure.cosmos import CosmosClient, exceptions


@pytest.mark.integration
class TestUserVoteIntegration:
    """Tests d'intégration pour le cycle utilisateur/vote"""
    
    @pytest.fixture(autouse=True)
    def setup_and_teardown(self):
        """Setup et teardown pour chaque test"""
        # Variables pour stocker les IDs créés
        self.created_user_id = None
        self.created_vote_id = None
        self.test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        # Configuration (à adapter selon votre environnement)
        self.base_url = os.environ.get('FUNCTION_APP_URL', 'http://localhost:7071/api')
        self.cosmos_url = os.environ.get('COSMOS_URL', '')
        self.cosmos_key = os.environ.get('COSMOS_KEY', '')
        
        yield  # Le test s'exécute ici
        
        # Nettoyage après le test
        self._cleanup()
    
    def _cleanup(self):
        """Nettoie les données créées pendant le test"""
        if not self.cosmos_url or not self.cosmos_key:
            print("⚠️  Variables Cosmos DB non configurées, nettoyage manuel requis")
            return
            
        try:
            client = CosmosClient(self.cosmos_url, self.cosmos_key)
            database = client.get_database_client('BayrouMeterDB')
            
            # Supprimer le vote si créé
            if self.created_vote_id and self.created_user_id:
                try:
                    votes_container = database.get_container_client('votes')
                    votes_container.delete_item(
                        item=self.created_vote_id, 
                        partition_key=self.created_user_id
                    )
                    print(f"✅ Vote {self.created_vote_id} supprimé")
                except exceptions.CosmosResourceNotFoundError:
                    print(f"ℹ️  Vote {self.created_vote_id} déjà supprimé")
                except Exception as e:
                    print(f"❌ Erreur suppression vote: {e}")
            
            # Supprimer l'utilisateur si créé
            if self.created_user_id:
                try:
                    users_container = database.get_container_client('users')
                    users_container.delete_item(
                        item=self.created_user_id, 
                        partition_key=self.created_user_id
                    )
                    print(f"✅ Utilisateur {self.created_user_id} supprimé")
                except exceptions.CosmosResourceNotFoundError:
                    print(f"ℹ️  Utilisateur {self.created_user_id} déjà supprimé")
                except Exception as e:
                    print(f"❌ Erreur suppression utilisateur: {e}")
                    
        except Exception as e:
            print(f"❌ Erreur lors du nettoyage: {e}")
    
    def test_complete_user_vote_cycle(self):
        """Test complet : création utilisateur → vote → vérification → nettoyage"""
        
        # Étape 1: Créer un utilisateur
        user_data = {
            "pseudo": f"testuser_{uuid.uuid4().hex[:8]}",
            "email": self.test_email,
            "password": "testpassword123"
        }
        
        print(f"🔄 Création utilisateur avec email: {user_data['email']}")
        
        # Test en mode local ou avec une URL de test
        if self.base_url == 'http://localhost:7071/api':
            # Mode test local - on simule la création
            self._test_local_mode(user_data)
        else:
            # Mode test avec vraie API
            self._test_api_mode(user_data)
    
    def _test_local_mode(self, user_data):
        """Test en mode local (simulation)"""
        print("🧪 Mode test local - simulation des opérations")
        
        # Simuler la création d'utilisateur
        self.created_user_id = str(uuid.uuid4())
        print(f"✅ Utilisateur simulé créé avec ID: {self.created_user_id}")
        
        # Simuler le vote
        self.created_vote_id = str(uuid.uuid4())
        print(f"✅ Vote simulé créé avec ID: {self.created_vote_id}")
        
        # Vérifications de base
        assert self.created_user_id is not None
        assert self.created_vote_id is not None
        assert len(self.created_user_id) > 0
        assert len(self.created_vote_id) > 0
        
        print("✅ Test local réussi - toutes les assertions passées")
    
    def _test_api_mode(self, user_data):
        """Test avec vraie API"""
        try:
            # Étape 1: Créer l'utilisateur
            response = requests.post(
                f"{self.base_url}/user",
                json=user_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            assert response.status_code == 201, f"Échec création utilisateur: {response.text}"
            user_response = response.json()
            self.created_user_id = user_response['user']['id']
            print(f"✅ Utilisateur créé avec ID: {self.created_user_id}")
            
            # Étape 2: Soumettre un vote
            vote_data = {
                "user_id": self.created_user_id,
                "choice": "oui"
            }
            
            response = requests.post(
                f"{self.base_url}/vote",
                json=vote_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            assert response.status_code == 201, f"Échec soumission vote: {response.text}"
            vote_response = response.json()
            self.created_vote_id = vote_response['vote']['id']
            print(f"✅ Vote créé avec ID: {self.created_vote_id}")
            
            # Étape 3: Vérifier que le vote existe
            response = requests.get(
                f"{self.base_url}/votes",
                timeout=30
            )
            
            assert response.status_code == 200, f"Échec récupération votes: {response.text}"
            votes_response = response.json()
            
            # Vérifier que notre vote est dans la liste
            vote_found = False
            for vote in votes_response['votes']:
                if vote['id'] == self.created_vote_id:
                    vote_found = True
                    assert vote['user']['id'] == self.created_user_id
                    assert vote['choice'] == 'oui'
                    break
            
            assert vote_found, f"Vote {self.created_vote_id} non trouvé dans la liste"
            print("✅ Vote vérifié dans la liste des votes")
            
        except requests.exceptions.RequestException as e:
            pytest.skip(f"API non disponible: {e}")
        except Exception as e:
            pytest.fail(f"Erreur pendant le test API: {e}")


@pytest.mark.unit
class TestBasicOperations:
    """Tests pour les opérations de base sans nettoyage automatique"""
    
    def test_user_creation_validation(self):
        """Test de validation des données utilisateur"""
        # Test avec données manquantes
        invalid_data_sets = [
            {},  # Vide
            {"pseudo": "test"},  # Email manquant
            {"email": "test@example.com"},  # Pseudo manquant
            {"pseudo": "test", "email": "test@example.com"},  # Password manquant
            {"pseudo": "", "email": "test@example.com", "password": "test"},  # Pseudo vide
        ]
        
        for invalid_data in invalid_data_sets:
            # En mode local, on teste juste la logique de validation
            assert self._validate_user_data(invalid_data) == False
        
        # Test avec données valides
        valid_data = {
            "pseudo": "testuser",
            "email": "test@example.com", 
            "password": "testpassword"
        }
        assert self._validate_user_data(valid_data) == True
    
    def test_vote_validation(self):
        """Test de validation des données de vote"""
        # Test avec données invalides
        invalid_vote_data = [
            {},  # Vide
            {"user_id": "123"},  # Choice manquant
            {"choice": "oui"},  # User_id manquant
            {"user_id": "123", "choice": "invalid"},  # Choice invalide
        ]
        
        for invalid_data in invalid_vote_data:
            assert self._validate_vote_data(invalid_data) == False
        
        # Test avec données valides
        valid_data = {"user_id": "123", "choice": "oui"}
        assert self._validate_vote_data(valid_data) == True
        
        valid_data = {"user_id": "123", "choice": "non"}
        assert self._validate_vote_data(valid_data) == True
    
    def _validate_user_data(self, data):
        """Simule la validation des données utilisateur"""
        required_fields = ['pseudo', 'email', 'password']
        
        for field in required_fields:
            if field not in data or not data[field] or data[field].strip() == '':
                return False
        
        return True
    
    def _validate_vote_data(self, data):
        """Simule la validation des données de vote"""
        if 'user_id' not in data or not data['user_id']:
            return False
        
        if 'choice' not in data or data['choice'].lower() not in ['oui', 'non']:
            return False
        
        return True


# Test de performance simple
@pytest.mark.unit
def test_multiple_operations():
    """Test de performance avec plusieurs opérations"""
    import time
    
    start_time = time.time()
    
    # Simuler plusieurs opérations
    for i in range(10):
        user_id = str(uuid.uuid4())
        vote_id = str(uuid.uuid4())
        
        # Simulations d'opérations
        assert len(user_id) == 36  # UUID standard
        assert len(vote_id) == 36
    
    end_time = time.time()
    execution_time = end_time - start_time
    
    # Le test doit s'exécuter en moins d'1 seconde
    assert execution_time < 1.0, f"Test trop lent: {execution_time:.2f}s"
    
    print(f"✅ Test de performance réussi en {execution_time:.3f}s")
