import dns from "dns";

// Ensure DNS SRV queries (e.g. MongoDB Atlas _mongodb._tcp) resolve reliably on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (error) {
  // Ignore fallback if custom DNS servers are restricted
}
