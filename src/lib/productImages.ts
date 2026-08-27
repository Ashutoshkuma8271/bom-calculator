// Curated high-resolution culinary & cold-chain images inspired by Akira Fresh (https://akirafresh.in/)
export interface PresetProductImage {
  id: string;
  name: string;
  category: string;
  url: string;
  alt: string;
}

export const AKIRA_PRODUCT_IMAGES: PresetProductImage[] = [
  {
    id: 'img-momo',
    name: 'Akira Gourmet Chicken Momos',
    category: 'Momos & Dimsums',
    url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=75',
    alt: 'Gourmet steamed chicken momos with spicy red chili chutney',
  },
  {
    id: 'img-seekh',
    name: 'Akira Royal Mutton Seekh Kebab',
    category: 'Kebabs & Grills',
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=75',
    alt: 'Charcoal flame grilled mutton seekh kebabs with mint and onions',
  },
  {
    id: 'img-tikka',
    name: 'Akira Smoky Tandoori Chicken Tikka',
    category: 'Kebabs & Grills',
    url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=75',
    alt: 'Juicy tandoori spiced chicken tikka cubes grilled to perfection',
  },
  {
    id: 'img-patty',
    name: 'Akira Crispy Chicken Burger Patty',
    category: 'Patties & Snacks',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=75',
    alt: 'Golden crispy crumbed chicken burger patty on artisan bun',
  },
  {
    id: 'img-shami',
    name: 'Akira Authentic Mutton Shami Kebab',
    category: 'Kebabs & Grills',
    url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=75',
    alt: 'Melt in mouth spiced minced mutton shami kebabs',
  },
  {
    id: 'img-nuggets',
    name: 'Akira Crunchy Chicken Popcorn & Nuggets',
    category: 'Patties & Snacks',
    url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=75',
    alt: 'Crispy golden fried chicken popcorn and crunchy nuggets',
  },
  {
    id: 'img-sausage',
    name: 'Akira Smoked Chicken Sausages',
    category: 'Breakfast & Deli',
    url: 'https://images.unsplash.com/photo-1585325701165-351af916e581?auto=format&fit=crop&w=600&q=75',
    alt: 'Gourmet smoked chicken breakfast sausages and herbs',
  },
  {
    id: 'img-coldchain',
    name: 'Akira Cold-Chain Shipper & Pack',
    category: 'Cold Chain & Logistics',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=75',
    alt: 'Temperature controlled cold-chain packaging and insulated box',
  },
];

// Material & Raw Ingredient Images
export const MATERIAL_IMAGES: Record<string, string> = {
  'chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=400&q=75',
  'mutton': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=400&q=75',
  'cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=400&q=75',
  'flour': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=75',
  'spice': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=75',
  'panko': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=75',
  'packaging': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=75',
  'ice': 'https://images.unsplash.com/photo-1584727638096-042c45049ebe?auto=format&fit=crop&w=400&q=75',
  'box': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=75',
  'oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=75',
};

/**
 * Resolves a high-quality product image URL from item fields, names, or categories.
 */
export function getProductImage(item: { imageUrl?: string; name?: string; category?: string; projectCode?: string }): string {
  if (item.imageUrl && item.imageUrl.trim() !== '') {
    return item.imageUrl;
  }

  const name = (item.name || '').toLowerCase();
  const category = (item.category || '').toLowerCase();
  const code = (item.projectCode || '').toLowerCase();

  if (name.includes('momo') || name.includes('dimsum') || code.includes('mom')) {
    return AKIRA_PRODUCT_IMAGES[0].url;
  }
  if (name.includes('seekh') || name.includes('kebab') || code.includes('keb')) {
    return AKIRA_PRODUCT_IMAGES[1].url;
  }
  if (name.includes('tikka') || name.includes('tandoori') || code.includes('tik')) {
    return AKIRA_PRODUCT_IMAGES[2].url;
  }
  if (name.includes('patty') || name.includes('burger') || code.includes('pat')) {
    return AKIRA_PRODUCT_IMAGES[3].url;
  }
  if (name.includes('shami') || name.includes('galouti') || code.includes('shm')) {
    return AKIRA_PRODUCT_IMAGES[4].url;
  }
  if (name.includes('nugget') || name.includes('popcorn') || name.includes('crispy') || code.includes('pop')) {
    return AKIRA_PRODUCT_IMAGES[5].url;
  }
  if (name.includes('sausage') || name.includes('salami') || name.includes('frank') || code.includes('sau')) {
    return AKIRA_PRODUCT_IMAGES[6].url;
  }
  if (category.includes('logistics') || category.includes('cold') || name.includes('shipper') || name.includes('delivery')) {
    return AKIRA_PRODUCT_IMAGES[7].url;
  }

  return AKIRA_PRODUCT_IMAGES[0].url;
}

/**
 * Resolves an ingredient/material image URL based on its name or category.
 */
export function getMaterialImage(material: { imageUrl?: string; name?: string; category?: string }): string {
  if (material.imageUrl && material.imageUrl.trim() !== '') {
    return material.imageUrl;
  }

  const name = (material.name || '').toLowerCase();
  const category = (material.category || '').toLowerCase();

  if (name.includes('chicken') || category.includes('protein')) {
    return MATERIAL_IMAGES.chicken;
  }
  if (name.includes('mutton') || name.includes('lamb') || name.includes('meat')) {
    return MATERIAL_IMAGES.mutton;
  }
  if (name.includes('cheese') || name.includes('dairy') || name.includes('mozzarella')) {
    return MATERIAL_IMAGES.cheese;
  }
  if (name.includes('flour') || name.includes('dough') || name.includes('wrapper')) {
    return MATERIAL_IMAGES.flour;
  }
  if (name.includes('spice') || name.includes('seasoning') || name.includes('herb') || name.includes('saffron')) {
    return MATERIAL_IMAGES.spice;
  }
  if (name.includes('crumb') || name.includes('panko') || name.includes('bread')) {
    return MATERIAL_IMAGES.panko;
  }
  if (name.includes('pouch') || name.includes('pack') || name.includes('retail box')) {
    return MATERIAL_IMAGES.packaging;
  }
  if (name.includes('gel') || name.includes('ice') || name.includes('phase')) {
    return MATERIAL_IMAGES.ice;
  }
  if (name.includes('shipper') || name.includes('eps') || name.includes('thermal')) {
    return MATERIAL_IMAGES.box;
  }
  if (name.includes('oil') || name.includes('ghee') || name.includes('fat')) {
    return MATERIAL_IMAGES.oil;
  }

  return MATERIAL_IMAGES.spice;
}
