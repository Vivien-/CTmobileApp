# CTmobileApp
CT mobile application, to be used with CT server

# On veut faire marcher l’appli sur android: il faut build l’application

Pour ça il faut le sdk d’android:
* dl Android Studio pour ubuntu (https://developer.android.com/studio/index.html)
c’est long mais ça permet de récupérer le sdk et un outil pour télécharger pleins de trucs utiles aussi
* set la variable d’env ANDROID_HOME au path du sdk ($HOME/Android/Sdk)
* set JAVA_HOME sur la dernière version du jdk (/usr/lib/jvm/java-8-oracle)

Après on peut build l’appli:
> cd $ionic_workspace/monApp/

Si android n’a pas était ajouté (ionic platform pour check si c’est le cas) : 
> ionic platform android

> ionic build android 

Connecter son device au pc via usb
Check que le device est connecté et en dév mode et prêt à recevoir des infos: 

> adb devices 

(le smartphone doit être listé et marqué comme “device”)

> ionic build android
> ionic run android

## Pour communiquer avec le serveur

> cd CTserveur
> nodejs app.js

Le serveur écoute sur localhost:8080/

Ici il n’y a pas de ionic serve, l’appli tourne sur le device.
Donc le proxy écrit dans $ionic_workspace/monApp/ionic.project n’est plus valable (son but est de marché simplement pour ionic serve)
Donc chaque requête dans le code en /data/X doit être changer en http://IP:PORT/data/X
Pour trouver l’IP: ifconfig et c’est l’ip localhost du pc
PORT c’est 8080 pour le moment

Dans $ionic_workspace/monApp/www/js/app.js il y a une unique variable dont il faut changer la valeur de IP pour que ça marche

Pb: les adresses en /data/X sont aussi utilisées dans $ionic_workspace/monApp/www/home.html donc là aussi il faut changer les adresses (3fois) mais comme c’est du html faut le faire à la main (y’a peut être moyen d’automatiser ça parceque c’est dans une balise angular-autocomplete, je sais pas trop pour le moment)

## Troubleshooting: 

Si adb devices ne le trouve pas: 
activer developper options on device
vérifier que le device n’attend une confirmation de recevoir des infos du pc
Si ionic build ne marche pas:
utiliser l’outil $ANDROID_HOME/tools/android pour installer ce qui est nécessaire
Si les images ne s’affichent pas:
Vérifier que dans le code les chemins sont tous relatifs ( pas /img/toto.png mais img/toto.png ou ../img/toto.png)

Je ne peux pas récupérer les données du serveur
checker que l’adresse ip est bonne, qu’en faisant http://IP:8080/data/lines sur un browser on récupère bien un json. Si c’est le cas le pb vient de l’adresse en dur dans le code
le pc et le device doivent être connecté au réseau wifi

## Ressources: 

build your app: http://ionicframework.com/docs/guide/testing.html
enable dev option on device: https://developer.android.com/studio/run/device.html 
