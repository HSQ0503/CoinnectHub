import { InstagramIcon, SOCIAL_LINKS, TikTokIcon } from "./social-icons";

export default function FollowSection() {
  return (
    <section className="follow-section" aria-labelledby="follow-heading">
      <div className="container-shell follow-inner">
        <div className="follow-copy">
          <p className="eyebrow">On social media</p>
          <h2 id="follow-heading" className="section-title">
            Follow us
          </h2>
          <p className="body-copy">
            Short, visual money tips for teens, posted on Instagram and TikTok.
            Come say hi and send us the questions you want answered.
          </p>
        </div>
        <div className="follow-buttons">
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noreferrer"
            className="follow-button"
          >
            <InstagramIcon size={22} /> Follow on Instagram
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a
            href={SOCIAL_LINKS.tiktok}
            target="_blank"
            rel="noreferrer"
            className="follow-button"
          >
            <TikTokIcon size={21} /> Follow on TikTok
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
