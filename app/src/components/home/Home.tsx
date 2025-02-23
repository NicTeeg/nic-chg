function Home() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold dark:text-white">Chart Changelog</h1>

      <div className="flex flex-col gap-4">
        <div className="prose dark:prose-invert max-w-none">
          <p>
            Track and manage Helm chart versions and their promotion history across different
            release channels.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
            <h2 className="mb-2 text-xl font-semibold">Charts</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Browse and filter Helm charts by repository. View chart details and version history.
            </p>
            <a href="#/charts" className="text-blue-600 hover:underline dark:text-blue-400">
              Browse Charts →
            </a>
          </div>

          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
            <h2 className="mb-2 text-xl font-semibold">Chart Changelog</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Track promotion history of chart versions across different release channels. View
              timeline of promotions and version details.
            </p>
            <a href="#/changelog" className="text-blue-600 hover:underline dark:text-blue-400">
              View Changelog →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
