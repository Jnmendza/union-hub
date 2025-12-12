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
          <h2 className='text-lg font-bold text-white mb-1'>
            1. Acceptance of Terms
          </h2>
          <p>
            By downloading, accessing, or using the Union Hub mobile application
            ("App"), you agree to be bound by this End User License Agreement
            ("Agreement"). If you do not agree to these terms, do not use the
            App.
          </p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-1'>
            2. Age Requirement
          </h2>
          <p>
            You must be at least 13 years of age to use this App. By using the
            App, you warrant that you meet this age requirement.
          </p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-1'>
            3. User Generated Content (UGC)
          </h2>
          <p>
            Union Hub allows users to post messages, images, and other content
            ("User Content"). You are solely responsible for the content you
            post. Union Hub acts as a passive conduit for the distribution of
            User Content and is not responsible for the opinions or content
            posted by users.
          </p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-1'>
            4. Code of Conduct & Zero Tolerance Policy
          </h2>
          <p>
            Union Hub is committed to maintaining a safe and respectful
            community. We have a Zero Tolerance Policy for objectionable content
            and abusive behavior. By using the App, you agree NOT to post
            content that:
          </p>
          <ul className='list-disc pl-5 mt-2 space-y-1'>
            <li>
              Is unlawful, threatening, abusive, harassing, defamatory,
              libelous, deceptive, or fraudulent.
            </li>
            <li>
              Promotes hate speech, violence, discrimination, or racism based on
              race, ethnicity, gender, religion, sexual orientation, or
              disability.
            </li>
            <li>
              Contains pornography, nudity, or sexually explicit material.
            </li>
            <li>Involves the exploitation of minors.</li>
            <li>Spams or solicits other users for commercial purposes.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-1'>
            5. Monitoring and Enforcement
          </h2>
          <p>
            Union Hub reserves the right, but does not assume the obligation, to
            monitor User Content.
          </p>
          <ul className='list-disc pl-5 mt-2 space-y-1'>
            <li>
              <strong>Reporting:</strong> Users can flag objectional content or
              abusive users directly within the App.
            </li>
            <li>
              <strong>Removal:</strong> We will review reported content within
              24 hours. Any content found to violate this Agreement will be
              removed immediately.
            </li>
            <li>
              <strong>Banning:</strong> We reserve the right to suspend or
              permanently ban any user who violates these terms, at our sole
              discretion, without prior notice.
            </li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-1'>
            6. Disclaimer of Warranties
          </h2>
          <p>
            The App is provided "AS IS" and "AS AVAILABLE" without warranties of
            any kind, either express or implied. Union Hub does not guarantee
            that the App will be uninterrupted or error-free.
          </p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-1'>
            7. Contact Information
          </h2>
          <p>
            For questions regarding this Agreement or to report violations,
            please contact us at: support@unionhub.com
          </p>
        </section>
      </div>
    </div>
  );
}
