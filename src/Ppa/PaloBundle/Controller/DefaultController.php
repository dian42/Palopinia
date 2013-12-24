<?php

namespace Ppa\PaloBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('PpaPaloBundle:Default:index.html.twig', array('name' => $name));
    }
}
