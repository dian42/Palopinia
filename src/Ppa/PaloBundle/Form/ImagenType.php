<?php

namespace Ppa\PaloBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class ImagenType extends AbstractType
{
        /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('nombre', null , array ( 'label' => 'Título' ) )
            ->add('descripcion', null , array ( 'label' => 'Descripción' ) )
            ->add('producto', null , array ( 'label' => 'Producto' ) )
            ->add('file')
        ;
    }
    
    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Ppa\PaloBundle\Entity\Imagen'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'ppa_palobundle_imagentype';
    }
}
