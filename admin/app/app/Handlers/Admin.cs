using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace app.Handlers
{
    class Admin
    {
        public static async Task<bool> Login(string uri, string token)
        {
            var http = new HttpClient();
            uri = Server.FilterURI(uri);

            string jsonBody = $@"{{
                ""token"": ""{token}""
            }}";


            if (await Server.Check(uri))
            {
                StringContent content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                var response = await http.PostAsync(uri + "/admin/Alogin", content);
                if (response.IsSuccessStatusCode)
                {
                    return true;
                }
            }

            return false;
        }
    }
}
