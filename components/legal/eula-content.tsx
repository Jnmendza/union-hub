import React from "react";

export function EulaContent() {
  return (
    <div className='space-y-6 text-slate-300'>
      <h1 className='text-2xl font-bold text-white mb-2'>
        Union Hub End User License Agreement (EULA)
      </h1>
      <p className='text-sm text-slate-500'>
        Last Updated: {new Date().toLocaleDateString()}
      </p>

      <div className='space-y-4 text-sm leading-relaxed'>
        <section>
          <h3 className='text-white font-bold text-base mb-2'>
            1. Agreement to Terms
          </h3>
          <p>
            By downloading, installing, or using &quot;Union Hub&quot; (the
            &quot;Service&quot;), you agree to be bound by this End User License
            Agreement (&quot;EULA&quot;). If you do not agree to the terms of
            this EULA, do not install or use the Service.
          </p>
        </section>

        <section>
          <h3 className='text-white font-bold text-base mb-2'>
            2. Age Requirement
          </h3>
          <p>
            You must be at least 18 years of age to use the Service. By agreeing
            to this EULA, you represent and warrant that you are 18 years or
            older.
          </p>
        </section>

        <section>
          <h3 className='text-white font-bold text-base mb-2'>
            3. User-Generated Content (UGC)
          </h3>
          <p>
            The Service allows you to post content (messages, images)
            (&quot;User Content&quot;). You retain ownership of your User
            Content, but you grant us a worldwide, non-exclusive, royalty-free
            license to use, reproduce, and display your User Content in
            connection with the Service.
          </p>
          <p className='mt-2'>
            You are solely responsible for your User Content. We do not endorse
            any User Content submitted to the Service.
          </p>
        </section>

        <section>
          <h3 className='text-white font-bold text-base mb-2'>
            4. Code of Conduct & Zero Tolerance Policy
          </h3>
          <p>
            We are committed to maintaining a safe and respectful community. We
            have a <strong>Zero Tolerance Policy</strong> for objectionable
            content and abusive behavior.
          </p>
          <p className='mt-2'>You agree NOT to post content that:</p>
          <ul className='list-disc pl-5 mt-1 space-y-1'>
            <li>
              Is unlawful, threatening, abusive, harassing, defamatory, or
              libelous.
            </li>
            <li>
              Promotes violence, discrimination, or hatred against individuals
              or groups.
            </li>
            <li>Contains sexually explicit material or nudity.</li>
            <li>Infringes on the intellectual property rights of others.</li>
            <li>Is spam, unsolicited advertising, or promotional material.</li>
          </ul>
        </section>

        <section>
          <h3 className='text-white font-bold text-base mb-2'>
            5. Content Monitoring & Moderation
          </h3>
          <p>
            We employ both automated systems and human moderators to monitor
            User Content. We reserve the right, but have no obligation, to
            remove or edit any User Content that violates this EULA or is
            otherwise objectionable, at our sole discretion and without notice.
          </p>
        </section>

        <section>
          <h3 className='text-white font-bold text-base mb-2'>
            6. Reporting and Blocking
          </h3>
          <p>
            You can report abusive users or content directly within the app
            using the &quot;Report&quot; feature in chat. You can also block
            users to stop seeing their messages. We review all reports within 24
            hours and take appropriate action, which may include removing
            content and suspending or banning users.
          </p>
        </section>

        <section>
          <h3 className='text-white font-bold text-base mb-2'>
            7. Termination
          </h3>
          <p>
            We may terminate or suspend your access to the Service immediately,
            without prior notice or liability, for any reason whatsoever,
            including without limitation if you breach this EULA.
          </p>
        </section>

        <section>
          <h3 className='text-white font-bold text-base mb-2'>
            8. Contact Information
          </h3>
          <p>
            If you have any questions about this EULA, please contact us at:
          </p>
          <p className='mt-1'>
            <strong>Email:</strong> contact@jonathanmendoza.dev
          </p>
          <p>
            <strong>Location:</strong> San Diego, CA
          </p>
        </section>
      </div>
    </div>
  );
}
