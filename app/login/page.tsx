"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "./actions";

const PARTNER_A = process.env.NEXT_PUBLIC_PARTNER_A_NAME || "Partner A";
const PARTNER_B = process.env.NEXT_PUBLIC_PARTNER_B_NAME || "Partner B";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [name, setName] = useState(PARTNER_A);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-sm tracking-wide text-ink-soft">A private place for</p>
        <h1 className="font-display text-4xl italic leading-tight text-ink">
          {PARTNER_A} &amp; {PARTNER_B}
        </h1>

        <form action={formAction} className="mt-10 space-y-6">
          <fieldset>
            <legend className="mb-2 text-sm text-ink-soft">Who&rsquo;s this?</legend>
            <div className="grid grid-cols-2 gap-3">
              {[PARTNER_A, PARTNER_B].map((n) => (
                <label
                  key={n}
                  className={`cursor-pointer border px-4 py-3 text-center transition-colors ${
                    name === n
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-paper-dim text-ink hover:border-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="name"
                    value={n}
                    checked={name === n}
                    onChange={() => setName(n)}
                    className="sr-only"
                  />
                  {n}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="passcode" className="mb-2 block text-sm text-ink-soft">
              Shared passcode
            </label>
            <input
              id="passcode"
              name="passcode"
              type="password"
              required
              autoFocus
              className="w-full border border-line bg-paper-dim px-4 py-3 text-ink outline-none focus:border-ink"
              placeholder="••••••••"
            />
          </div>

          {state.error && <p className="text-sm text-blush">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-ink px-4 py-3 text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Checking…" : "Come in"}
          </button>
        </form>
      </div>
    </main>
  );
}
