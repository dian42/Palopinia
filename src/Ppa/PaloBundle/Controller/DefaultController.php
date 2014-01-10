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
    public function indexAction($medicina)
    {
        $em = $this->getDoctrine()->getManager();

        $entitie = $em->getRepository('PpaPaloBundle:Producto')->findAll();

        return $this->render('PpaPaloBundle:Default:index.html.twig', array(
            'entitie' => $entitie,
            'medicina' => $medicina,
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

    public function mostrarAction($idTipo,$medicina)
    {
        $em = $this->getDoctrine()->getManager();

        $entitie = $em->getRepository('PpaPaloBundle:Producto')->findByTipoproducto($idTipo);

        return $this->render('PpaPaloBundle:Default:index.html.twig', array(
            'entitie' => $entitie,
            'medicina' => $medicina,
        ));
    }

        public function contactoAction($medicina)
    {
            return $this->render('PpaPaloBundle:Default:contacto.html.twig',array(
            'medicina' => $medicina,
        ));
    }

    public function pictureAction($idProd)
    {
        $em = $this->getDoctrine()->getManager();

        $entitie = $em->getRepository('PpaPaloBundle:Imagen')->findOneByProducto($idProd);

        return $this->render('PpaPaloBundle:Default:picture.html.twig', array(
            'entitie' => $entitie,
        ));
    }

    public function pagproductoAction($idProd)
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('PpaPaloBundle:Producto')->findById($idProd);

        return $this->render('PpaPaloBundle:Default:pagproducto.html.twig', array(
            'entities' => $entities,
        ));
    }

    public function articuloAction($idProd,$medicina)
    {
        $em = $this->getDoctrine()->getManager();

        $entitie = $em->getRepository('PpaPaloBundle:Imagen')->findByProducto($idProd);

        return $this->render('PpaPaloBundle:Default:articulo.html.twig', array(
            'entitie' => $entitie,
            'medicina' => $medicina,
        ));
    }
}
