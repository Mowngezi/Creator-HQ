# Privacy

Last updated: 1 May 2026

CreatorHQ is operated from Johannesburg, South Africa, by Mongezi Xhoma. We follow POPIA principles and keep this short on purpose.

## What we collect

When you build a kit, we store:

- Your **public profile** (name, bio, audience numbers, rates, photo). This is the kit itself; it is meant to be shared.
- A **recovery contact** (email or SA cell). We store a salted SHA-256 hash, not the raw value.
- A **date of birth**. We store a salted SHA-256 hash, not the raw value.
- A random **owner token** in a per-kit cookie on your device, scoped to your kit URL, valid for 30 days.

We do not collect a password. We do not run third-party analytics. We do not sell anything to anyone.

## Why we collect it

- **Public profile**: that's the product. The kit is shared on your terms.
- **Hashed contact + DOB**: so you can recover edit access from a new device. We compare hashes; we never see the raw value after you submit it.
- **Cookie**: so editing your own kit on the same device feels like editing your own kit, not a stranger's.

## What we do not do

- We do not email you. We do not message you. We do not have a mailing list.
- We do not share your hashed contact, hashed DOB, or owner token with anyone.
- We do not run pixel trackers, fingerprinters, or session replay.
- We do not show ads.

## How long we keep it

Your kit lives until you delete it. There is currently no self-serve delete; **email mongezi@simulacra.studio** and we will remove your kit and all associated hashes within seven days.

## Your rights under POPIA

You can ask what we hold on you, ask us to correct it, ask us to delete it, or ask how we use it. **mongezi@simulacra.studio.** We answer within seven days.

## Cookies

One cookie per kit: `chq_owner_<id>`. httpOnly, sameSite=lax, scoped to `/c/<id>`, 30-day expiry. No third-party cookies.

## Hosting

CreatorHQ runs on Railway (United States) with media on Supabase Storage (Frankfurt). By using the service you accept that your public profile is stored in those regions.

## Changes

If we change this page we update the date at the top. Material changes get a one-line note on the home page for at least seven days.

## Contact

mongezi@simulacra.studio
