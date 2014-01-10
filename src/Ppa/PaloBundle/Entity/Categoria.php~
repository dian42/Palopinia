<?php

namespace Ppa\PaloBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * Categoria
 *
 * @ORM\Table()
 * @ORM\Entity
 */
class Categoria
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="nombre", type="string", length=100)
     */
    private $nombre;

    /**
     * @var string
     *
     * @ORM\Column(name="descripcion", type="string", length=255)
     */
    private $descripcion;

    public function __toString() {
        return $this->nombre;
    }

    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set nombre
     *
     * @param string $nombre
     * @return Categoria
     */
    public function setNombre($nombre)
    {
        $this->nombre = $nombre;
    
        return $this;
    }

    /**
     * Get nombre
     *
     * @return string 
     */
    public function getNombre()
    {
        return $this->nombre;
    }

    /**
     * Set descripcion
     *
     * @param string $descripcion
     * @return Categoria
     */
    public function setDescripcion($descripcion)
    {
        $this->descripcion = $descripcion;
    
        return $this;
    }

    /**
     * Get descripcion
     *
     * @return string 
     */
    public function getDescripcion()
    {
        return $this->descripcion;
    }

    /**
     * @ORM\OneToMany(targetEntity="TipoProducto", mappedBy="categoria")
     */
    protected $tipoproductos;
 
    public function __construct()
    {
        $this->tipoproductos = new ArrayCollection();
    }

    /**
     * Add tipoproductos
     *
     * @param \Ppa\PaloBundle\Entity\TipoProducto $tipoproductos
     * @return Categoria
     */
    public function addTipoproducto(\Ppa\PaloBundle\Entity\TipoProducto $tipoproductos)
    {
        $this->tipoproductos[] = $tipoproductos;
    
        return $this;
    }

    /**
     * Remove tipoproductos
     *
     * @param \Ppa\PaloBundle\Entity\TipoProducto $tipoproductos
     */
    public function removeTipoproducto(\Ppa\PaloBundle\Entity\TipoProducto $tipoproductos)
    {
        $this->tipoproductos->removeElement($tipoproductos);
    }

    /**
     * Get tipoproductos
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getTipoproductos()
    {
        return $this->tipoproductos;
    }
}