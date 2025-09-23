export const BottomText = () => {
  return (
    <div className="flex justify-center items-center py-4 px-4">
      <p className="text-sm text-gray-500 text-center">
        En utilisant My Binhas, vous acceptez nos{" "}
        <a
          href="https://www.bgds.fr/mentions-cgv-mybinhas/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          conditions générales d'utilisation
        </a>
        .
      </p>
    </div>
  );
};
