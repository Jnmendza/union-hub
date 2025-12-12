import React from "react";

export function PrivacyContent() {
  return (
    <div className='space-y-6 text-slate-300'>
      <h1 className='text-2xl font-bold text-white mb-2'>Privacy Policy</h1>
      <p className='text-sm text-slate-500'>Last Updated: December 11, 2025</p>

      <div className='space-y-4 text-sm leading-relaxed'>
        <section>
          <h2 className='text-lg font-bold text-white mb-1'>1. Introduction</h2>
          <p>
            Welcome to Union Hub (&quot;we,&quot; &quot;our,&quot; or
            &quot;us&quot;). We respect your privacy and are committed to
            protecting your personal data. This Privacy Policy explains how we
            collect, use, and share information when you use our mobile
            application and website (collectively, the &quot;Service&quot;).
          </p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-1'>
            2. Information We Collect
          </h2>
          <p>We collect two types of information:</p>

          <h3 className='text-white font-semibold mt-2'>
            A. Information You Provide to Us
          </h3>
          <ul className='list-disc pl-5 mt-1 space-y-1'>
            <li>
              <strong>Account Information:</strong> When you register, we
              collect your email address, date of birth (for age verification),
              and a password (encrypted).
            </li>
            <li>
              <strong>Profile Information:</strong> We collect the username and
              profile picture you choose to upload.
            </li>
            <li>
              <strong>User-Generated Content (UGC):</strong> We collect and
              store the messages, images, and content you post in chat groups.
            </li>
          </ul>

          <h3 className='text-white font-semibold mt-2'>
            B. Information Collected Automatically
          </h3>
          <ul className='list-disc pl-5 mt-1 space-y-1'>
            <li>
              <strong>Device Information:</strong> We may collect information
              about the device you use to access the Service, including the
              hardware model, operating system, and unique device identifiers.
            </li>
            <li>
              <strong>Analytics:</strong> We use Google Analytics for Firebase
              to collect anonymous usage data (e.g., session duration, crash
              reports) to improve app stability and performance.
            </li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-1'>
            3. How We Use Your Information
          </h2>
          <p>We use your data for the following purposes:</p>
          <ul className='list-disc pl-5 mt-2 space-y-1'>
            <li>
              <strong>To Provide the Service:</strong> Managing your account,
              facilitating real-time chat, and syncing data across devices.
            </li>
            <li>
              <strong>Safety & Moderation:</strong> To enforce our Zero
              Tolerance Policy against objectionable content.
            </li>
            <li>
              <strong>Age Verification:</strong> Your date of birth is used
              solely to confirm you meet the minimum age requirement (18+).
            </li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-1'>
            4. Third-Party Services
          </h2>
          <p>
            We use Google Firebase as our backend infrastructure. Firebase
            processes data on our behalf to provide authentication, database,
            and storage services.
          </p>
          <ul className='list-disc pl-5 mt-2 space-y-1'>
            <li>
              <strong>Firebase Authentication:</strong> Used to manage user
              logins securely.
            </li>
            <li>
              <strong>Cloud Firestore:</strong> Used to store chat history and
              user profiles.
            </li>
            <li>
              <strong>Google Analytics for Firebase:</strong> Used to track
              aggregate usage metrics.
            </li>
          </ul>
          <p className='mt-2'>
            For more information, please visit the Google Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-1'>
            5. Data Retention and Deletion
          </h2>
          <p>
            <strong>Retention:</strong> We retain your personal information only
            as long as your account is active.
          </p>
          <p className='mt-2'>
            <strong>Deletion:</strong> You have the right to request the
            deletion of your account and data. You may do this directly within
            the app settings or by contacting us at contact@jonathanmendoza.dev.
            Upon request, your account and personal data will be permanently
            removed.
          </p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-1'>
            6. California Residents (CCPA)
          </h2>
          <p>
            Under the California Consumer Privacy Act (CCPA), California
            residents have the right to request access to or deletion of their
            personal data. We do not sell your personal information to third
            parties. To exercise your rights, please contact us at the email
            below.
          </p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-1'>
            7. Protection of Minors
          </h2>
          <p>
            The Service is intended for users 18 years of age and older. We do
            not knowingly collect personal information from individuals under
            18. If we become aware that we have collected personal data from a
            minor without verification, we will remove that information
            immediately.
          </p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-1'>8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <div className='mt-2'>
            <p>
              <strong>Email:</strong> contact@jonathanmendoza.dev
            </p>
            <p>
              <strong>Location:</strong> San Diego, CA
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
