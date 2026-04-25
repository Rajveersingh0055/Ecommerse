// Fix: use new schema fields (name, images, mrp/sellingPrice) instead of old (title, imageUrl, price)
export default function Card({ product }) {
  return (
    <article className="card">
      <img
        src={product.images?.[0] || "https://picsum.photos/600/400?random=99"}
        alt={product.name}
        className="card-image"
      />
      <div className="card-body">
        <h3>{product.name}</h3>
        <p>{product.type} · {product.brand}</p>
        <strong>₹{product.sellingPrice}</strong>
      </div>
    </article>
  );
}
