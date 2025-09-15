{/* HERO (video background) */}
<section className="hero-skims">
  <video
    className="hero-video"
    autoPlay
    loop
    muted
    playsInline
    poster="/images/hero-mobile.jpg"   // fallback poster while loading
  >
    <source src="/videos/hero.mp4" type="video/mp4" />
    {/* Optional second format, if you have it:
    <source src="/videos/hero.webm" type="video/webm" /> */}
    Your browser does not support the video tag.
  </video>

  <div className="hero-overlay">
    <h1>Effortless Essentials</h1>
    <p>Premium tees & hoodies for every day.</p>
    <div className="hero-actions">
      <Link className="btn-solid" to="/collections/Oversized%20T-Shirts">Shop T-Shirts</Link>
      <Link className="btn-outline" to="/collections/Hoodies">Shop Hoodies</Link>
    </div>
  </div>
</section>
