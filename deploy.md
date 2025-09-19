# Guide de déploiement - Bayrou Meter

Ce guide vous explique comment déployer l'application Bayrou Meter complète sur Azure.

## Architecture

L'application utilise :
- **Azure Functions** pour l'API backend (Python)
- **Azure Cosmos DB** pour la base de données NoSQL
- **Azure Static Web Apps** pour héberger le frontend React
- **TanStack Query** pour la gestion des données côté client

## Étapes de déploiement

### 1. Prérequis

```bash
# Vérifier les outils installés
func --version  # Azure Functions Core Tools 4.x
az --version    # Azure CLI
node --version  # Node.js pour le frontend
python --version # Python 3.10+
```

### 2. Créer le Resource Group

```bash
az group create \
  --name BayrouMeterRG \
  --location francecentral
```

### 3. Déployer Cosmos DB

```bash
# Remplacez <votre-login> par votre identifiant unique
az cosmosdb create \
  --name bayroudb<votre-login> \
  --resource-group BayrouMeterRG \
  --kind GlobalDocumentDB \
  --locations regionName=francecentral failoverPriority=0 isZoneRedundant=False

# Récupérer l'URL et la clé
COSMOS_URL=$(az cosmosdb show \
  --name bayroudb<votre-login> \
  --resource-group BayrouMeterRG \
  --query documentEndpoint \
  --output tsv)

COSMOS_KEY=$(az cosmosdb keys list \
  --name bayroudb<votre-login> \
  --resource-group BayrouMeterRG \
  --query primaryMasterKey \
  --output tsv)

echo "COSMOS_URL: $COSMOS_URL"
echo "COSMOS_KEY: $COSMOS_KEY"
```

### 4. Déployer l'API Azure Functions

```bash
cd bayrou-meter-api

# Créer un Storage Account pour Functions
az storage account create \
  --name bayroustorage<votre-login> \
  --location francecentral \
  --resource-group BayrouMeterRG \
  --sku Standard_LRS

# Créer la Function App
az functionapp create \
  --resource-group BayrouMeterRG \
  --consumption-plan-location francecentral \
  --runtime python \
  --runtime-version 3.10 \
  --functions-version 4 \
  --name bayrou-api-<votre-login> \
  --storage-account bayroustorage<votre-login> \
  --os-type Linux

# Configurer les variables d'environnement
az functionapp config appsettings set \
  --name bayrou-api-<votre-login> \
  --resource-group BayrouMeterRG \
  --settings COSMOS_URL="$COSMOS_URL" COSMOS_KEY="$COSMOS_KEY"

# Publier le code
func azure functionapp publish bayrou-api-<votre-login>
```

### 5. Déployer le Frontend avec Azure Static Web Apps

```bash
cd ../frontend

# Créer le fichier .env pour la production
echo "VITE_API_URL=https://bayrou-api-<votre-login>.azurewebsites.net/api" > .env

# Build du frontend
npm run build

# Créer la Static Web App
az staticwebapp create \
  --name bayrou-frontend-<votre-login> \
  --resource-group BayrouMeterRG \
  --source https://github.com/<votre-username>/<votre-repo> \
  --location "West Europe" \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist"
```

### 6. Configuration CORS (si nécessaire)

```bash
# Permettre au frontend d'accéder à l'API
az functionapp cors add \
  --name bayrou-api-<votre-login> \
  --resource-group BayrouMeterRG \
  --allowed-origins "https://<votre-static-web-app-url>"
```

## Test de l'application

### URLs finales

- **Frontend** : `https://<static-web-app-url>`
- **API** : `https://bayrou-api-<votre-login>.azurewebsites.net/api`

### Tests des endpoints

```bash
# Test création utilisateur
curl -X POST https://bayrou-api-<votre-login>.azurewebsites.net/api/user \
  -H "Content-Type: application/json" \
  -d '{"pseudo": "test", "email": "test@example.com"}'

# Test récupération des votes
curl https://bayrou-api-<votre-login>.azurewebsites.net/api/votes
```

## Monitoring

- **Application Insights** : Automatiquement configuré avec la Function App
- **Cosmos DB Metrics** : Disponible dans le portail Azure
- **Static Web Apps Analytics** : Disponible dans le portail Azure

## Dépannage

### Problèmes courants

1. **Erreur CORS** : Vérifier la configuration CORS de la Function App
2. **Cosmos DB non accessible** : Vérifier les variables d'environnement
3. **Build frontend échoue** : Vérifier les variables d'environnement VITE_

### Logs

```bash
# Logs de la Function App
az webapp log tail --name bayrou-api-<votre-login> --resource-group BayrouMeterRG

# Logs de déploiement Static Web App
az staticwebapp show --name bayrou-frontend-<votre-login> --resource-group BayrouMeterRG
```

## Nettoyage des ressources

```bash
# Supprimer tout le resource group
az group delete --name BayrouMeterRG --yes --no-wait
```
