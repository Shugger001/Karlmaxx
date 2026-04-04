/** Prints SQL UPDATEs for public.products — run: node scripts/generate-pexels-product-images-sql.mjs */

function px(id) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;
}

const rows = [
  {
    id: "cc01f0c9-0f33-46c4-a962-040431afc807",
    imgs: [998219, 190819, 1697912],
    colors: [
      ["#94a3b8", "Silver", 998219],
      ["#b76e79", "Rose", 190819],
      ["#ca8a04", "Gold", 1697912],
    ],
  },
  {
    id: "30cee172-7246-4d7a-b81f-a5b85e4d733a",
    imgs: [1484801, 769732, 996329],
    colors: [
      ["#8b8680", "Stone", 1484801],
      ["#1e293b", "Ink", 325876],
      ["#d4c4b0", "Oat", 769732],
    ],
  },
  {
    id: "f9854ecd-2fe2-4a89-b9ec-8470eef759de",
    imgs: [2529148, 1473215, 336372],
    colors: [
      ["#3c2414", "Espresso", 2529148],
      ["#0a0a0a", "Black", 336372],
      ["#b8956a", "Tan", 1473215],
    ],
  },
  {
    id: "ee32d307-7518-4883-befc-fd6b1931dac1",
    imgs: [190819, 998219, 437037],
    colors: [
      ["#64748b", "Steel", 190819],
      ["#171717", "Black PVD", 437037],
      ["#78716c", "Two-tone", 998219],
    ],
  },
  {
    id: "49b2d693-4edf-424a-a08e-ca5e43e107ef",
    imgs: [1152077, 2905238, 1192601],
    colors: [
      ["#556b2f", "Olive", 1152077],
      ["#1a1a1a", "Black", 2905238],
      ["#6b4423", "Cognac", 1192601],
    ],
  },
  {
    id: "cfe96ce4-a56b-4372-a088-edc51fd9c071",
    imgs: [58703, 159888, 4720271],
    colors: [
      ["#f5f5f4", "White marble", 58703],
      ["#262626", "Black slate", 159888],
      ["#1e3a8a", "Navy", 4720271],
    ],
  },
  {
    id: "67739844-cb88-4cfa-992d-69611a752d85",
    imgs: [1473215, 267301, 2529148],
    colors: [
      ["#c19a6b", "Tan", 1473215],
      ["#1e293b", "Navy", 267301],
      ["#78716c", "Stone", 2529148],
    ],
  },
  {
    id: "21e041c3-852d-4e4b-8c25-2019a5fe461d",
    imgs: [965990, 996329, 581087],
    colors: [
      ["#1a1a1a", "Noir", 965990],
      ["#b45309", "Amber", 996329],
      ["#b8860b", "Gold cap", 581087],
    ],
  },
  {
    id: "35bacc69-9f0d-4e6f-9d7b-b5f5e3fa8682",
    imgs: [581087, 965990, 1927259],
    colors: [
      ["#e2e8f0", "Frost", 581087],
      ["#6b9080", "Sage", 965990],
      ["#1e3a5f", "Marine", 1927259],
    ],
  },
  {
    id: "8542870b-4f0c-4f72-9732-b797df4aa4de",
    imgs: [1697912, 190819, 998219],
    colors: [
      ["#1d4ed8", "Steel & blue", 1697912],
      ["#171717", "Black ceramic", 190819],
      ["#9a3412", "Bronze", 998219],
    ],
  },
  {
    id: "019eb1be-5867-42fd-a32a-32c956792344",
    imgs: [325876, 4720271, 1336875],
    colors: [
      ["#6b4423", "Cognac leather", 325876],
      ["#171717", "Black", 4720271],
      ["#1e3a8a", "Navy", 1336875],
    ],
  },
  {
    id: "3399bd6a-c093-423a-8a89-1a02e0cb8c8b",
    imgs: [1656684, 581087, 175709],
    colors: [
      ["#36454f", "Charcoal", 1656684],
      ["#c19a6b", "Camel", 581087],
      ["#111111", "Black", 175709],
    ],
  },
  {
    id: "f8438192-14da-462f-b6e0-aa2ecadafdb9",
    imgs: [267301, 2529148, 1473215],
    colors: [
      ["#f5f5f5", "White", 267301],
      ["#111111", "Black", 2529148],
      ["#64748b", "Grey", 1473215],
    ],
  },
  {
    id: "69064e03-1c2c-4c65-963f-41963007a7ad",
    imgs: [1300576, 998219, 190819],
    colors: [
      ["#cbd5e1", "Silver mesh", 1300576],
      ["#1e3a8a", "Navy face", 998219],
      ["#0a0a0a", "Black", 190819],
    ],
  },
  {
    id: "ec31b63b-9bc4-477f-9b25-0ba98b0c25c0",
    imgs: [336372, 1473215, 2529148],
    colors: [
      ["#111111", "Black", 336372],
      ["#7a5230", "Cognac", 1473215],
      ["#722f37", "Burgundy", 2529148],
    ],
  },
  {
    id: "bbe5d326-7839-4d71-ae55-5e02c5830a2d",
    imgs: [1927259, 965990, 581087],
    colors: [
      ["#44403c", "Smoke", 1927259],
      ["#7c6f9e", "Iris", 965990],
      ["#fafaf9", "Ivory", 581087],
    ],
  },
  {
    id: "00807171-8614-4ce3-8ad9-1172a9df4e25",
    imgs: [4720271, 159888, 58703],
    colors: [
      ["#374151", "Space grey", 4720271],
      ["#e5e7eb", "Silver", 159888],
      ["#1e3a8a", "Navy", 58703],
    ],
  },
  {
    id: "95c10d62-2a9b-4157-a6ae-d6305c0babcb",
    imgs: [276549, 1055691, 1484801],
    colors: [
      ["#f8f8f8", "White", 276549],
      ["#9ec1ff", "Powder blue", 1055691],
      ["#1a1a1a", "Black", 1484801],
    ],
  },
  {
    id: "8da3006e-3741-43ae-b431-7f05669a70a1",
    imgs: [1336875, 996329, 769732],
    colors: [
      ["#722f37", "Burgundy", 1336875],
      ["#111111", "Black", 996329],
      ["#1e3a8a", "Navy", 769732],
    ],
  },
  {
    id: "cdaa3f01-5635-44af-b4e1-e9ed140e9d50",
    imgs: [437037, 998219, 190819],
    colors: [
      ["#78716c", "Titanium", 437037],
      ["#0f172a", "Midnight", 998219],
      ["#94a3b8", "Silver", 190819],
    ],
  },
  {
    id: "d73fe2b6-9cc1-4481-827c-43a57e9de276",
    imgs: [2905238, 1152077, 1192601],
    colors: [
      ["#4a3728", "Cocoa", 2905238],
      ["#111111", "Black", 1152077],
      ["#4a0e0e", "Oxblood", 1192601],
    ],
  },
  {
    id: "c13cbea2-ba1d-4b1e-9402-40c759b061d3",
    imgs: [3641056, 336372, 1473215],
    colors: [
      ["#1e3a8a", "Navy", 3641056],
      ["#6b5b4f", "Snuff", 336372],
      ["#1a1a1a", "Black", 1473215],
    ],
  },
  {
    id: "0c397e7c-ecd9-4ccb-8c3b-477143f70d4a",
    imgs: [5325762, 325876, 581087],
    colors: [
      ["#2d2d2d", "Charcoal", 5325762],
      ["#0f172a", "Midnight", 325876],
      ["#c2b280", "Sand", 581087],
    ],
  },
  {
    id: "ffd75e8b-4ad8-44d7-bc34-0237c88ebede",
    imgs: [1927259, 996329, 965990],
    colors: [
      ["#0f172a", "Travel set A", 1927259],
      ["#78350f", "Travel set B", 996329],
      ["#111111", "Gift black", 965990],
    ],
  },
  {
    id: "84563613-ca7a-478d-8c39-44fe8d804540",
    imgs: [1055691, 1152077, 2905238],
    colors: [
      ["#556b2f", "Olive", 1055691],
      ["#2d2d2d", "Charcoal", 1152077],
      ["#d2b48c", "Sand", 2905238],
    ],
  },
  {
    id: "2f40c0de-da93-49be-a73b-6b291eb146ac",
    imgs: [164879, 159888, 4720271],
    colors: [
      ["#292524", "Graphite", 164879],
      ["#f5f5f4", "Pearl", 159888],
      ["#1e3a8a", "Navy case", 4720271],
    ],
  },
];

for (const r of rows) {
  const imgs = r.imgs.map(px);
  const co = r.colors.map(([hex, name, pid]) => ({
    hex,
    name,
    image: px(pid),
  }));
  const json = JSON.stringify(co).replace(/'/g, "''");
  const arr = imgs.map((u) => `'${u.replace(/'/g, "''")}'`).join(", ");
  console.log(`UPDATE public.products SET images = ARRAY[${arr}], color_options = '${json}'::jsonb WHERE id = '${r.id}';`);
}
