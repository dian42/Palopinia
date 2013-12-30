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
	
    public function indexAction( )
    {
    	$em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('PpaPaloBundle:TipoProducto')->findAll();

        return $this->render('PpaPaloBundle:Producto:index.html.twig', array(
            'lista_tipo' => $entities,
        ));

    }
}
