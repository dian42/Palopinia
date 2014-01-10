<?php

namespace Ppa\PaloBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * Producto
 *
 * @ORM\Table()
 * @ORM\Entity
 */
class Producto
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
     * @var integer
     *
     * @ORM\Column(name="precio", type="integer")
     */
    private $precio;

    /**
     * @var string
     *
     * @ORM\Column(name="descripcion", type="string", length=3000)
     */
    private $descripcion;

    /**
     * @var string
     *
     * @ORM\Column(name="descripcionBreve", type="string", length=80)
     */
    private $descripcionBreve;

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
     * @return Producto
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
     * Set precio
     *
     * @param integer $precio
     * @return Producto
     */
    public function setPrecio($precio)
    {
        $this->precio = $precio;
    
        return $this;
    }

    /**
     * Get precio
     *
     * @return integer 
     */
    public function getPrecio()
    {
        return $this->precio;
    }

    /**
     * Set descripcion
     *
     * @param string $descripcion
     * @return Producto
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
     * Set descripcionBreve
     *
     * @param string $descripcion
     * @return Producto
     */
    public function setDescripcionBreve($descripcionBreve)
    {
        $this->descripcionBreve = $descripcionBreve;
    
        return $this;
    }

    /**
     * Get descripcionBreve
     *
     * @return string 
     */
    public function getDescripcionBreve()
    {
        return $this->descripcionBreve;
    }


    /**
     * @ORM\OneToMany(targetEntity="Imagen", mappedBy="producto")
     */
    protected $imagens;
 
    public function __construct()
    {
        $this->imagens = new ArrayCollection();
    }

    /**
     * @ORM\ManyToOne(targetEntity="TipoProducto", inversedBy="productos")
     * @ORM\JoinColumn(name="tipoproducto_id", referencedColumnName="id", nullable=false)
     */
    protected $tipoproducto;

    /**
     * Add imagens
     *
     * @param \Ppa\PaloBundle\Entity\Imagen $imagens
     * @return Producto
     */
    public function addImagen(\Ppa\PaloBundle\Entity\Imagen $imagens)
    {
        $this->imagens[] = $imagens;
    
        return $this;
    }

    /**
     * Remove imagens
     *
     * @param \Ppa\PaloBundle\Entity\Imagen $imagens
     */
    public function removeImagen(\Ppa\PaloBundle\Entity\Imagen $imagens)
    {
        $this->imagens->removeElement($imagens);
    }

    /**
     * Get imagens
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getImagens()
    {
        return $this->imagens;
    }

    /**
     * Set tipoproducto
     *
     * @param \Ppa\PaloBundle\Entity\TipoProducto $tipoproducto
     * @return Producto
     */
    public function setTipoproducto(\Ppa\PaloBundle\Entity\TipoProducto $tipoproducto = null)
    {
        $this->tipoproducto = $tipoproducto;
    
        return $this;
    }

    /**
     * Get tipoproducto
     *
     * @return \Ppa\PaloBundle\Entity\TipoProducto 
     */
    public function getTipoproducto()
    {
        return $this->tipoproducto;
    }
}