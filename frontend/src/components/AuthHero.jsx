import heroImage from "../assets/auth-hero.png";

const AuthHero = () => {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#F7F5FF]">
      <img
        src={heroImage}
        alt="Fintelli AI"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
};

export default AuthHero;
