Feature: Fiabilite des utilitaires du marketplace
  # Scénarios critiques couvrant JWT et calculs prix/remise/taxe
  Scenario: Roundtrip JWT valide
    Given un utilisateur avec l'id 501 et l'email "acheteur@test.com"
    When je genere un token JWT
    Then je recupere un payload contenant l'id 501 et l'email "acheteur@test.com"

  Scenario: Token mal forme refuse
    Given un token JWT invalide "abc.def"
    When je tente de verifier le token JWT
    Then une erreur "Format de token invalide" est levee

  Scenario: Calcul complet de prix avec remise et taxes
    Given un panier avec un sous-total de 120 et une remise de 15 pourcent
    When je calcule le total TTC avec une taxe de 0.2
    Then le total TTC formate est "$122.40"
    And le montant final numerique est 122.4
