import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const img = product.images?.[0] || 'https://via.placeholder.co/600x600?text=LETZ+PLAY';
  return (
    <div className="card">
      <Link to={`/product/${product.sku}`}>
        <img src={img} alt={product.name} />
      </Link>
      <div className="card-body">
        <h3>{product.name}</h3>
        <p>${product.price}</p>
        <small>Trending: {Math.floor(Math.random()*10)+1} people</small>
      </div>
    </div>
  );
}
