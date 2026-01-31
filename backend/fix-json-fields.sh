#!/bin/bash
cd prisma

# Supprimer tous les @default sur les champs Json et les rendre optionnels
sed -i 's/\(.*\)Json\s\+@default("\[\]")/\1Json?/g' schema.prisma
sed -i 's/\(.*\)Json\s\+@default(\[\])/\1Json?/g' schema.prisma

# Supprimer les @index et @unique sur les champs qui contiennent "Json"
sed -i '/Json?/s/@index//g' schema.prisma
sed -i '/Json?/s/@unique//g' schema.prisma

echo "✅ Tous les champs JSON ont été nettoyés"
