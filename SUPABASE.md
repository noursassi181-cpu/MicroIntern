# Guide : MicroIntern + Supabase + Vercel

## 1. Créer le projet Supabase
1. Allez sur supabase.com, connectez-vous, cliquez **New project**, donnez un nom et un mot de passe de base (gardez-le, ne le collez nulle part).
2. Attendez la fin de la création.

## 2. Récupérer les clés
1. **Project Settings > API** (ou le bouton **Connect**).
2. Copiez **Project URL** et **Publishable key** (jamais la clé *secret* ou *service_role*).
3. Ouvrez `supabase-client.js` et remplacez `VOTRE-PROJECT-URL` et `VOTRE-PUBLISHABLE-KEY`.

## 3. Lancer le SQL
1. **SQL Editor > New query**, collez `supabase-setup.sql`, cliquez **Run**. Le fichier contient la partie 1 (services), la partie 2 (admin, en commentaire) et la partie 3 (commandes). Il est prévu pour une base neuve.

1b. Ensuite, **New query**, collez `supabase-students.sql` et **Run** : cela permet aux étudiants de publier leurs propres services (ils sont en ligne tout de suite ; l'admin peut les masquer ou supprimer).

1c. Puis **New query**, collez `supabase-extras.sql` et **Run** : messages de contact et avis des clients.

## 4. Configurer l'authentification
1. **Authentication > URL Configuration** : mettez **Site URL** = votre adresse (ex. `http://localhost:8000`, puis l'adresse `.vercel.app`).
2. Ajoutez la même adresse avec `/**` dans **Redirect URLs**.
3. Inscrivez-vous sur le site, ouvrez l'e-mail de confirmation, cliquez le lien.

## 5. Devenir admin
1. **Authentication > Users** : copiez votre UUID.
2. Dans SQL Editor, lancez la ligne `insert into public.user_roles ...` (partie 2) avec votre UUID.
3. Reconnectez-vous : le lien **Admin** apparaît.

## 6. Tester en local
Dans le dossier : `python -m http.server 8000`, puis ouvrez `http://localhost:8000`. Testez avec un visiteur, deux clients et l'admin.

## 7. Vercel
1. Mettez le dossier sur GitHub (nouveau dépôt, **Add file > Upload files**).
2. Sur vercel.com : **Add New > Project**, importez le dépôt.
3. Framework Preset : **Other**. Build Command : vide. Output Directory : vide (racine). **Deploy**.
4. Remettez l'adresse `.vercel.app` dans les URL de Supabase (étape 4) et testez en HTTPS.

## Erreurs fréquentes
- *Mot de passe oublié sans effet* : ajoutez votre adresse (avec `/**`) dans Redirect URLs.
- *Rien ne se charge / services de démo* : les clés ne sont pas remplacées.
- *Connexion impossible* : e-mail pas encore confirmé.
- *Lien de confirmation vers localhost* : corrigez Site URL.
- *Page admin refusée* : l'UUID n'a pas été ajouté, ou reconnectez-vous.
