export const BottomText = () => {
  return (
    <div className="flex justify-center items-center p-4">
      <p className="text-sm text-gray-500 text-center">
        En utilisant My Binhas, vous acceptez nos{" "}
        <a
          href="https://www.bgds.fr/mentions-cgv-mybinhas/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          conditions générales d&apos;utilisation
        </a>
        .
      </p>
    </div>
  );
};
