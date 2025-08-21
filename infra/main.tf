terraform {
  required_providers {
    keycloak = {
      source  = "registry.terraform.io/mrparkers/keycloak"
      version = "~> 4.4"
    }
  }
}

provider "keycloak" {
  client_id = "admin-cli"
  username  = "admin"
  password  = "admin"
  url       = "http://localhost:8080"
}

resource "keycloak_realm" "auth_example" {
  realm   = "auth_example"
  enabled = true
}

resource "keycloak_openid_client" "service_a" {
  realm_id                     = keycloak_realm.auth_example.id
  client_id                    = "service-a"
  access_type                  = "CONFIDENTIAL"
  service_accounts_enabled     = true
  standard_flow_enabled        = false
  direct_access_grants_enabled = false
}

resource "keycloak_openid_client" "service_b" {
  realm_id                     = keycloak_realm.auth_example.id
  client_id                    = "service-b"
  access_type                  = "CONFIDENTIAL"
  service_accounts_enabled     = true
  standard_flow_enabled        = false
  direct_access_grants_enabled = false
}

output "service_a_client_secret" {
  value     = keycloak_openid_client.service_a.client_secret
  sensitive = true
}

output "service_b_client_secret" {
  value     = keycloak_openid_client.service_b.client_secret
  sensitive = true
}
