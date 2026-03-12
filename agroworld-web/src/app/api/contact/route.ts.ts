import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, profile, message } = body;

  const profileLabels: Record<string, string> = {
    agri: "Agriculteur pilote",
    coop: "Cooperative / Negoce",
    investor: "Investisseur",
    research: "Recherche / Institut",
    other: "Autre",
  };

  try {
    await resend.emails.send({
      from: "AgroWorld <onboarding@resend.dev>",
      to: ["denisjoyau@gmail.com"],
      subject: `Nouveau contact AgroWorld : ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#2a9d8f;margin-bottom:4px;">Nouveau contact AgroWorld</h2>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#666;width:140px;">Nom / Structure</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#2a9d8f;">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#666;">Profil</td><td style="padding:8px 0;">${profileLabels[profile] || profile || "Non renseigne"}</td></tr>
          </table>
          ${message ? `
          <div style="margin-top:16px;">
            <p style="color:#666;margin-bottom:8px;">Message :</p>
            <div style="background:#f9f9f9;border-left:3px solid #2a9d8f;padding:12px 16px;border-radius:4px;color:#333;">
              ${message.replace(/
/g, "<br/>")}
            </div>
          </div>` : ""}
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="color:#999;font-size:12px;">Envoye depuis agro-world.vercel.app</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json({ ok: false, error: "Erreur envoi email" }, { status: 500 });
  }
}
