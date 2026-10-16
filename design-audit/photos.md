# Image provenance

Braise is a fictional restaurant (a portfolio demo). Every image comes from a free photo bank (Unsplash License or Pexels License: commercial use allowed, no attribution required). The images are loaded remotely and optimised by `next/image`; none is stored in `public/`.

None of these photos shows the restaurant itself. **For a real client, replace them with the client's own photos.**

## Site atmosphere (`lib/images.ts`)

| Use | Source | What the photo shows |
|---|---|---|
| Home hero | Pexels 12261087 | Bone-in rib of beef seared over the grill flames |
| "Le feu" band | Pexels 14887408 | Glowing embers in the dark |
| "La maison" section | Pexels 36169156 | Cook at the grill, meat over the fire |
| Home closing | Unsplash photo-1414235077428-338989a2e8c0 | Table set by candlelight |

## Menu dishes (`prisma/seed.ts`)

| Dish | Source | What the photo shows |
|---|---|---|
| Velouté de butternut | Unsplash photo-1547592166-23ac45744acd | Orange velouté, seeds |
| Tartare de daurade | Pexels 8611130 | Thin slices of raw fish with herbs |
| Burrata | Pexels 26833230 | Burrata on cherry tomatoes |
| Champignons braisés | Pexels 4661880 | Mushrooms browned in a pan |
| Côte de bœuf | Unsplash photo-1558030006-450675393462 | Sliced grilled beef |
| Lieu jaune | Pexels 16064369 | White fish fillet seared skin-side, chives |
| Risotto d'épeautre | Unsplash photo-1476124369491-e7addf5db371 | Creamy risotto in a deep plate |
| Canard de Challans | Pexels 29799014 | Sliced pink duck breast |
| Légumes au feu, houmous | Pexels 30488354 | Chickpea and hummus salad |
| Gnocchis | Pexels 6659627 | Golden gnocchi |
| Fondant au chocolat | Pexels 24247232 | Slice of chocolate cake |
| Tarte aux pommes | Unsplash photo-1621743478914-cc8a86d7e7b5 | Apple pie |
| Poire pochée | Pexels 30648994 | Roasted pear, creamy topping (approximate: not poached in wine) |
| Vin nature | Unsplash photo-1510812431401-41d2bd2722f3 | Glasses of red wine |
| Cocktail Braise fumée | Unsplash photo-1470337458703-46ad1756a187 | Amber cocktail over ice, orange zest |
| Café | Pexels 1233528 | Espresso in a glass cup |

## Gallery (`lib/gallery.ts`)

12 images taken from the two tables above, plus Pexels 29279929 (flames and smoke over the hearth) and Unsplash photo-1552566626-52f8b828add9 (restaurant dining room). Each alt text describes the actual photo.

## 3D

`assets/3d/apercu-etape-1.png` is a render of the Blender scene `assets/3d/braise-buches.blend`, which was built procedurally in this session. It is not used on the site.
