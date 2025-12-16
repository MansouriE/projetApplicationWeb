import React from "react";
import FormInput from "./FormInput";

export default function EmailPasswordFields({
  email,
  setEmail,
  password,
  setPassword,
}) {
  return (
    <>
      <FormInput
        label="Email"
        type="email"
        placeholder="Entrez votre email"
        value={email}
        onChange={setEmail}
        required
        dataTest="email"
      />

      <FormInput
        label="Mot de passe"
        type="password"
        placeholder="Entrez votre mot de passe"
        value={password}
        onChange={setPassword}
        required
        dataTest="password"
      />
    </>
  );
}
