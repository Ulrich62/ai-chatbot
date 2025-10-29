# Guide de Déploiement Docker sur VPS

Ce guide explique comment configurer le déploiement automatique de l'application ai-chatbot sur le VPS avec Docker.

## 📋 Prérequis

- Accès SSH au VPS (`ssh denemlabs@65.21.233.153`)
- Clé SSH configurée pour l'accès GitHub Actions
- Repository GitHub avec les secrets configurés

## 🚀 Configuration Initiale du VPS

### 1. Se connecter au VPS

```bash
ssh denemlabs@65.21.233.153
```

### 2. Installer Docker

```bash
# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Redémarrer la session SSH pour que les permissions prennent effet
exit
```

### 3. Vérifier l'installation

```bash
# Vérifier Docker
docker --version

# Vérifier Docker Compose
docker-compose --version
```

## 🔐 Configuration des Secrets GitHub

Les secrets suivants doivent être configurés dans GitHub Actions :
- ✅ `VPS_HOST`: 65.21.233.153
- ✅ `VPS_USERNAME`: denemlabs
- ✅ `VPS_SSH_KEY`: Clé SSH privée
- ✅ Variables d'environnement de l'application

## 🎯 Déploiement Automatique

Une fois le VPS configuré, le déploiement se fait automatiquement :

### Via GitHub Actions

1. **Push sur la branche `dev`** → Déploiement automatique déclenché
2. **Ou déclencher manuellement** via l'interface GitHub Actions

### Processus de déploiement

Le workflow GitHub Actions va :
1. ✅ Construire l'image Docker
2. ✅ Pousser l'image vers GitHub Container Registry
3. ✅ Se connecter au VPS
4. ✅ Télécharger la nouvelle image
5. ✅ Arrêter et supprimer l'ancien conteneur
6. ✅ Démarrer le nouveau conteneur
7. ✅ Vérifier que l'application fonctionne

## 🛠️ Commandes Utiles sur le VPS

```bash
# Voir les logs de l'application
docker logs ai-chatbot-dev

# Voir le statut des conteneurs
docker ps

# Redémarrer l'application
docker restart ai-chatbot-dev

# Arrêter l'application
docker stop ai-chatbot-dev

# Voir les logs en temps réel
docker logs -f ai-chatbot-dev

# Accéder au shell du conteneur
docker exec -it ai-chatbot-dev sh
```

## 🔍 Monitoring

### Docker Monitoring

```bash
# Vue d'ensemble
docker stats

# Informations détaillées
docker inspect ai-chatbot-dev

# Logs en temps réel
docker logs -f ai-chatbot-dev --tail 50
```

### Vérification de l'application

```bash
# Vérifier que le port 3000 écoute
sudo netstat -tlnp | grep 3000

# Test HTTP
curl http://localhost:3000
```

## 🔄 Rollback en cas de problème

Si un déploiement échoue :

```bash
cd /home/denemlabs/ai-chatbot

# Lister les images disponibles
docker images | grep ai-chatbot

# Utiliser une image précédente
docker stop ai-chatbot-dev
docker rm ai-chatbot-dev
docker run -d --name ai-chatbot-dev -p 3000:3000 --env-file .env.production <IMAGE_ID>
```

## 🐛 Dépannage

### L'application ne démarre pas

1. Vérifier les logs : `docker logs ai-chatbot-dev`
2. Vérifier les variables d'environnement : `docker exec ai-chatbot-dev env`
3. Vérifier que Docker fonctionne : `docker ps`

### Erreur de connexion SSH

Vérifier que la clé SSH est bien configurée dans GitHub Secrets (`VPS_SSH_KEY`)

### Erreur de build

Vérifier les logs GitHub Actions pour voir où le build échoue

## 📞 Support

En cas de problème, vérifier :
1. Les logs GitHub Actions
2. Les logs Docker sur le VPS : `docker logs ai-chatbot-dev`
3. Le statut de l'application : `docker ps`