import Link from "next/link";
import { menuItems } from "@/data/mock";

export default function EditMenuItemPage({ params }: { params: { id: string } }) {
  const item = menuItems.find((entry) => entry.id === params.id) || menuItems[0];

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Edit Menu Item</h1>
          <p>Adjust item details, price, availability, and featured status.</p>
        </div>
        <Link href="/menu" className="primary-button secondary">Back to Menu</Link>
      </div>
      <section className="form-panel">
        <div className="form-grid two-col">
          <div className="field">
            <label>Name</label>
            <input defaultValue={item.name} />
          </div>
          <div className="field">
            <label>Category</label>
            <input defaultValue={item.category} />
          </div>
          <div className="field">
            <label>Price</label>
            <input defaultValue={item.price} />
          </div>
          <div className="field">
            <label>Prep minutes</label>
            <input defaultValue={item.prepMinutes} />
          </div>
          <label className="row form-span">
            <input type="checkbox" defaultChecked={item.available} />
            Available for ordering
          </label>
          <label className="row form-span">
            <input type="checkbox" defaultChecked={item.featured} />
            Featured item
          </label>
          <button className="primary-button form-span">Save Changes</button>
        </div>
      </section>
    </div>
  );
}
