<?php

namespace Ppa\PaloBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

use Ppa\PaloBundle\Entity\Producto;
use Ppa\PaloBundle\Form\ProductoType;

class DefaultController extends Controller
{
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entitie = $em->getRepository('PpaPaloBundle:Producto')->findAll();

        return $this->render('PpaPaloBundle:Default:index.html.twig', array(
            'entitie' => $entitie,
        ));
    }

    public function listaAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('PpaPaloBundle:TipoProducto')->findAll();

        return $this->render('PpaPaloBundle:Default:lista.html.twig', array(
            'entities' => $entities,
        ));
    }

    public function mostrarAction($idTipo)
    {
        $em = $this->getDoctrine()->getManager();

        $entitie = $em->getRepository('PpaPaloBundle:Producto')->findByTipoproducto($idTipo);

        return $this->render('PpaPaloBundle:Default:index.html.twig', array(
            'entitie' => $entitie,
        ));
    }
}
