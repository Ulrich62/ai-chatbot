# Guide de Déploiement sur VPS

Ce guide explique comment configurer le déploiement automatique de l'application ai-chatbot sur le VPS.

## 📋 Prérequis

- Accès SSH au VPS (`ssh denemlabs@65.21.233.153`)
- Clé SSH configurée pour l'accès GitHub Actions
- Repository GitHub avec les secrets configurés

## 🚀 Configuration Initiale du VPS

### 1. Se connecter au VPS

```bash
ssh denemlabs@65.21.233.153
```

### 2. Télécharger et exécuter le script de configuration

```bash
# Télécharger le script depuis GitHub
curl -o setup-vps.sh https://raw.githubusercontent.com/Ulrich62/ai-chatbot/dev/scripts/setup-vps.sh

# Rendre le script exécutable
chmod +x setup-vps.sh

# Exécuter le script
./setup-vps.sh
```

Le script va :
- ✅ Installer Node.js 20
- ✅ Installer pnpm 9.12.3
- ✅ Installer PM2
- ✅ Installer nginx (reverse proxy)
- ✅ Configurer le firewall
- ✅ Créer le répertoire de l'application

### 3. Vérifier l'installation

```bash
# Vérifier Node.js
node --version  # Doit afficher v20.x.x

# Vérifier pnpm
pnpm --version  # Doit afficher 9.12.3

# Vérifier PM2
pm2 --version

# Vérifier nginx
nginx -v
```

## 🔐 Configuration des Secrets GitHub

Tous les secrets sont déjà configurés dans GitHub Actions :
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
1. ✅ Vérifier le code
2. ✅ Installer les dépendances
3. ✅ Exécuter le linting
4. ✅ Build l'application
5. ✅ Créer une archive de déploiement
6. ✅ Uploader l'archive sur le VPS
7. ✅ Extraire et installer les dépendances de production
8. ✅ Configurer les variables d'environnement
9. ✅ Démarrer l'application avec PM2
10. ✅ Vérifier que l'application fonctionne

## 🛠️ Commandes Utiles sur le VPS

```bash
# Voir les logs de l'application
pm2 logs ai-chatbot-dev

# Voir le statut de l'application
pm2 status

# Redémarrer l'application
pm2 restart ai-chatbot-dev

# Arrêter l'application
pm2 stop ai-chatbot-dev

# Voir les logs nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Redémarrer nginx
sudo systemctl restart nginx

# Vérifier que l'application répond
curl http://localhost:3000
```

## 🔍 Monitoring

### PM2 Monitoring

```bash
# Vue d'ensemble
pm2 monit

# Informations détaillées
pm2 show ai-chatbot-dev

# Logs en temps réel
pm2 logs ai-chatbot-dev --lines 50
```

### Vérification de l'application

```bash
# Vérifier que le port 3000 écoute
sudo netstat -tlnp | grep 3000

# Vérifier les processus Node.js
ps aux | grep node
```

## 🔄 Rollback en cas de problème

Si un déploiement échoue :

```bash
cd /home/denemlabs/ai-chatbot

# Lister les backups disponibles
ls -la .next.backup.*

# Restaurer un backup précédent
pm2 stop ai-chatbot-dev
rm -rf .next
mv .next.backup.YYYYMMDD_HHMMSS .next
pm2 restart ai-chatbot-dev
```

## 📝 Configuration Nginx (Optionnel)

Si vous avez un domaine, modifiez `/etc/nginx/sites-available/ai-chatbot` :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Puis rechargez nginx :
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 🐛 Dépannage

### L'application ne démarre pas

1. Vérifier les logs : `pm2 logs ai-chatbot-dev`
2. Vérifier les variables d'environnement : `cat /home/denemlabs/ai-chatbot/.env.production`
3. Vérifier que Node.js et pnpm sont installés : `node --version && pnpm --version`
4. Vérifier les permissions : `ls -la /home/denemlabs/ai-chatbot`

### Erreur de connexion SSH

Vérifier que la clé SSH est bien configurée dans GitHub Secrets (`VPS_SSH_KEY`)

### Erreur de build

Vérifier les logs GitHub Actions pour voir où le build échoue

## 📞 Support

En cas de problème, vérifier :
1. Les logs GitHub Actions
2. Les logs PM2 sur le VPS
3. Les logs nginx
4. Le statut de l'application : `pm2 status`
