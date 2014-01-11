<?php

namespace Ppa\PaloBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Ppa\PaloBundle\Entity\TipoProducto;
use Ppa\PaloBundle\Form\TipoProductoType;

/**
 * TipoProducto controller.
 *
 */
class TipoProductoController extends Controller
{

    /**
     * Lists all TipoProducto entities.
     *
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('PpaPaloBundle:TipoProducto')->findAll();

        return $this->render('PpaPaloBundle:TipoProducto:index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new TipoProducto entity.
     *
     */
    public function createAction(Request $request)
    {
        $entity = new TipoProducto();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('tipoproducto_show', array('id' => $entity->getId())));
        }

        return $this->render('PpaPaloBundle:TipoProducto:new.html.twig', array(
            'entity' => $entity,
            'form'   => $form->createView(),
        ));
    }

    /**
    * Creates a form to create a TipoProducto entity.
    *
    * @param TipoProducto $entity The entity
    *
    * @return \Symfony\Component\Form\Form The form
    */
    private function createCreateForm(TipoProducto $entity)
    {
        $form = $this->createForm(new TipoProductoType(), $entity, array(
            'action' => $this->generateUrl('tipoproducto_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Crear', 'attr' => array('class' => 'btn btn-success')));

        return $form;
    }

    /**
     * Displays a form to create a new TipoProducto entity.
     *
     */
    public function newAction()
    {
        $entity = new TipoProducto();
        $form   = $this->createCreateForm($entity);

        return $this->render('PpaPaloBundle:TipoProducto:new.html.twig', array(
            'entity' => $entity,
            'form'   => $form->createView(),
        ));
    }

    /**
     * Finds and displays a TipoProducto entity.
     *
     */
    public function showAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('PpaPaloBundle:TipoProducto')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find TipoProducto entity.');
        }

        $deleteForm = $this->createDeleteForm($id);

        return $this->render('PpaPaloBundle:TipoProducto:show.html.twig', array(
            'entity'      => $entity,
            'delete_form' => $deleteForm->createView(),        ));
    }

    /**
     * Displays a form to edit an existing TipoProducto entity.
     *
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('PpaPaloBundle:TipoProducto')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find TipoProducto entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($id);

        return $this->render('PpaPaloBundle:TipoProducto:edit.html.twig', array(
            'entity'      => $entity,
            'edit_form'   => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
    * Creates a form to edit a TipoProducto entity.
    *
    * @param TipoProducto $entity The entity
    *
    * @return \Symfony\Component\Form\Form The form
    */
    private function createEditForm(TipoProducto $entity)
    {
        $form = $this->createForm(new TipoProductoType(), $entity, array(
            'action' => $this->generateUrl('tipoproducto_update', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Cambiar', 'attr' => array('class' => 'btn btn-info')));

        return $form;
    }
    /**
     * Edits an existing TipoProducto entity.
     *
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('PpaPaloBundle:TipoProducto')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find TipoProducto entity.');
        }

        $deleteForm = $this->createDeleteForm($id);
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isValid()) {
            $em->flush();

            return $this->redirect($this->generateUrl('tipoproducto_edit', array('id' => $id)));
        }

        return $this->render('PpaPaloBundle:TipoProducto:edit.html.twig', array(
            'entity'      => $entity,
            'edit_form'   => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a TipoProducto entity.
     *
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this->createDeleteForm($id);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('PpaPaloBundle:TipoProducto')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find TipoProducto entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('tipoproducto'));
    }

    /**
     * Creates a form to delete a TipoProducto entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('tipoproducto_delete', array('id' => $id)))
            ->setMethod('DELETE')
            ->add('submit', 'submit', array('label' => 'Borrar', 'attr' => array('class' => 'btn btn-danger')))
            ->getForm()
        ;
    }
}
