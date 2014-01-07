<?php

namespace Ppa\PaloBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * TipoProducto
 *
 * @ORM\Table()
 * @ORM\Entity
 */
class TipoProducto
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
     * @return TipoProducto
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
     * @return TipoProducto
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
     * @ORM\OneToMany(targetEntity="Producto", mappedBy="tipoproducto")
     */
    protected $productos;
 
    public function __construct()
    {
        $this->productos = new ArrayCollection();
    }

    /**
     * @ORM\ManyToOne(targetEntity="Categoria", inversedBy="tipoproductos")
     * @ORM\JoinColumn(name="categoria_id", referencedColumnName="id", nullable=false)
     */
    protected $categoria;

    /**
     * Add productos
     *
     * @param \Ppa\PaloBundle\Entity\Producto $productos
     * @return TipoProducto
     */
    public function addProducto(\Ppa\PaloBundle\Entity\Producto $productos)
    {
        $this->productos[] = $productos;
    
        return $this;
    }

    /**
     * Remove productos
     *
     * @param \Ppa\PaloBundle\Entity\Producto $productos
     */
    public function removeProducto(\Ppa\PaloBundle\Entity\Producto $productos)
    {
        $this->productos->removeElement($productos);
    }

    /**
     * Get productos
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getProductos()
    {
        return $this->productos;
    }

    /**
     * Set categoria
     *
     * @param \Ppa\PaloBundle\Entity\Categoria $categoria
     * @return TipoProducto
     */
    public function setCategoria(\Ppa\PaloBundle\Entity\Categoria $categoria = null)
    {
        $this->categoria = $categoria;
    
        return $this;
    }

    /**
     * Get categoria
     *
     * @return \Ppa\PaloBundle\Entity\Categoria 
     */
    public function getCategoria()
    {
        return $this->categoria;
    }
}