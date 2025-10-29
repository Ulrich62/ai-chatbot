#!/bin/bash

# Script de configuration initiale du VPS pour l'application ai-chatbot
# À exécuter une seule fois sur le VPS

set -e

echo "🚀 Configuration du VPS pour ai-chatbot..."

# Mise à jour du système
echo "📦 Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# Installation de Node.js 20
echo "📦 Installation de Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation de pnpm
echo "📦 Installation de pnpm..."
npm install -g pnpm@9.12.3

# Installation de PM2
echo "📦 Installation de PM2..."
npm install -g pm2

# Installation de nginx (optionnel, pour reverse proxy)
echo "📦 Installation de nginx..."
sudo apt install -y nginx

# Création du répertoire de l'application
echo "📁 Création du répertoire de l'application..."
mkdir -p /home/denemlabs/ai-chatbot
cd /home/denemlabs/ai-chatbot

# Configuration de nginx (reverse proxy)
echo "⚙️ Configuration de nginx..."
sudo tee /etc/nginx/sites-available/ai-chatbot << EOF
server {
    listen 80;
    server_name _;  # Remplacer par votre domaine si vous en avez un
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Activation du site nginx
sudo ln -sf /etc/nginx/sites-available/ai-chatbot /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test de la configuration nginx
sudo nginx -t

# Redémarrage de nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configuration du firewall (optionnel)
echo "🔒 Configuration du firewall..."
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw --force enable

# Configuration de PM2 pour le démarrage automatique
echo "⚙️ Configuration de PM2..."
pm2 startup
pm2 save

# Création d'un script de déploiement local
cat > /home/denemlabs/deploy.sh << 'EOF'
#!/bin/bash
cd /home/denemlabs/ai-chatbot

# Arrêt de l'application
pm2 stop ai-chatbot-dev 2>/dev/null || true

# Mise à jour du code (si déployé manuellement)
if [ -f "deployment.tar.gz" ]; then
    tar -xzf deployment.tar.gz
    rm deployment.tar.gz
fi

# Installation des dépendances
pnpm install --frozen-lockfile --prod

# Démarrage de l'application
pm2 start npm --name "ai-chatbot-dev" -- start
pm2 save

echo "✅ Déploiement terminé!"
EOF

chmod +x /home/denemlabs/deploy.sh

echo "✅ Configuration du VPS terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Configurez les secrets GitHub Actions"
echo "2. Poussez votre code sur la branche dev"
echo "3. Le déploiement se lancera automatiquement"
echo ""
echo "🔧 Commandes utiles:"
echo "- Voir les logs: pm2 logs ai-chatbot-dev"
echo "- Redémarrer: pm2 restart ai-chatbot-dev"
echo "- Status: pm2 status"
echo "- Déploiement manuel: /home/denemlabs/deploy.sh"
