export default function Loader() {
  return (
    <div className="flex items-center justify-center h-screen bg-blue-100 ">
      <div className="relative w-24 h-24">
        {/* Rotating gradient ring */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-r from-blue-900 via-yellow-700 to-orange-500 animate-ping" />

        {/* Cutout inner circle (to simulate ring) */}
        <div className="absolute inset-2 bg-white rounded-full z-10"></div>

        {/* Static image on top */}
        <div className="absolute inset-5 flex items-center justify-center z-20">
          <img src="/icon-72x72.png" alt="Loading" className="w-12 h-12" />
        </div>
      </div>
    </div>
  );
}