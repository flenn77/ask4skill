#!/bin/bash

# Rechercher et supprimer tous les fichiers qui se terminent par ":Zone.Identifier"
find . -type f -name "*:Zone.Identifier" -exec rm -f "{}" \;

echo "Tous les fichiers ':Zone.Identifier' ont été supprimés."
