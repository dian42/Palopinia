[1mdiff --cc src/Ppa/PaloBundle/Resources/config/routing.yml[m
[1mindex 9339874,e953f74..0000000[m
[1m--- a/src/Ppa/PaloBundle/Resources/config/routing.yml[m
[1m+++ b/src/Ppa/PaloBundle/Resources/config/routing.yml[m
[36m@@@ -8,5 -8,5 +8,9 @@@[m [mcontacto[m
      path:  /contacto[m
      defaults: { _controller: PpaPaloBundle:Default:contacto }[m
  pagproducto:[m
[32m++<<<<<<< HEAD[m
[32m +    path:  /articulo/{idProd}[m
[32m++=======[m
[32m+     path:  /pagproducto[m
[32m++>>>>>>> ad2734135f18e4428ae57ec32176f4d73883fc47[m
      defaults: { _controller: PpaPaloBundle:Default:pagproducto }[m
