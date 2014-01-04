<?php

namespace Ppa\PaloBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

use Ppa\PaloBundle\Entity\Imagen;
use Ppa\PaloBundle\Form\ImagenType;

/**
 * Imagen controller.
 *
 */
class ImagenController extends Controller
{

    /**
     * Lists all Imagen entities.
     *
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('PpaPaloBundle:Imagen')->findAll();

        return $this->render('PpaPaloBundle:Imagen:index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Imagen entity.
     *
     */
    public function createAction(Request $request)
    {
        $entity = new Imagen();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('imagen_show', array('id' => $entity->getId())));
        }

        return $this->render('PpaPaloBundle:Imagen:new.html.twig', array(
            'entity' => $entity,
            'form'   => $form->createView(),
        ));
    }

    /**
    * Creates a form to create a Imagen entity.
    *
    * @param Imagen $entity The entity
    *
    * @return \Symfony\Component\Form\Form The form
    */
    private function createCreateForm(Imagen $entity)
    {
        $form = $this->createForm(new ImagenType(), $entity, array(
            'action' => $this->generateUrl('imagen_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new Imagen entity.
     *
     */
    public function newAction()
    {
        $entity = new Imagen();
        //$form   = $this->createCreateForm($entity);
        $form   = $this->createForm(new ImagenType(), $entity);

        return $this->render('PpaPaloBundle:Imagen:new.html.twig', array(
            'entity' => $entity,
            'form'   => $form->createView(),
        ));
    }

    /**
     * Finds and displays a Imagen entity.
     *
     */
    public function showAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('PpaPaloBundle:Imagen')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Imagen entity.');
        }

        $deleteForm = $this->createDeleteForm($id);

        return $this->render('PpaPaloBundle:Imagen:show.html.twig', array(
            'entity'      => $entity,
            'delete_form' => $deleteForm->createView()  ));
    }

    /**
     * Displays a form to edit an existing Imagen entity.
     *
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('PpaPaloBundle:Imagen')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Imagen entity.');
        }

        //$editForm = $this->createEditForm($entity);

        $editForm = $this->createForm(new ImagenType(), $entity);
        $deleteForm = $this->createDeleteForm($id);

        return $this->render('PpaPaloBundle:Imagen:edit.html.twig', array(
            'entity'      => $entity,
            'edit_form'   => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
    * Creates a form to edit a Imagen entity.
    *
    * @param Imagen $entity The entity
    *
    * @return \Symfony\Component\Form\Form The form
    */
    private function createEditForm(Imagen $entity)
    {
        $form = $this->createForm(new ImagenType(), $entity, array(
            'action' => $this->generateUrl('imagen_update', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Imagen entity.
     *
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('PpaPaloBundle:Imagen')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Imagen entity.');
        }

        $deleteForm = $this->createDeleteForm($id);
        //$editForm = $this->createEditForm($entity);
        $editForm = $this->createForm(new ImagenType(), $entity);
        $editForm->bind($request);

        if ($editForm->isValid()) {
            $em->flush();

            return $this->redirect($this->generateUrl('imagen_edit', array('id' => $id)));
        }

        return $this->render('PpaPaloBundle:Imagen:edit.html.twig', array(
            'entity'      => $entity,
            'edit_form'   => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a Imagen entity.
     *
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this->createDeleteForm($id);
        $form->bind($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('PpaPaloBundle:Imagen')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Imagen entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('imagen'));
    }

    /**
     * Creates a form to delete a Imagen entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        return $this->createFormBuilder(array('id' => $id))
            ->add('id', 'hidden')
            ->getForm()
        ;
    }

    public function uploadAction()
    {
        // ...


         $document = new Imagen();
            $form = $this->createFormBuilder($document)
                ->add('name')
                ->add('file')
                ->getForm()
            ;

            if ($this->getRequest()->isMethod('POST')) {
                $form->bind($this->getRequest());
                if ($form->isValid()) {
                    $em = $this->getDoctrine()->getManager();

                    $em->persist($document);
                    $em->flush();

                    return $this->redirect($this->generateUrl('/var/www/Palopinia/web/'));
                }

             return array('form' => $form->createView());
                // ...
            }

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();

                $document->upload();

                $em->persist($document);
                $em->flush();

                return $this->redirect('/var/www/Palopinia/web/');
            }
    }

}
