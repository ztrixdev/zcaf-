
using app.Handlers;
using Microsoft.UI.Xaml.Controls;
using System.Threading.Tasks;


namespace app.Pages
{
    public sealed partial class MainPage : Page
    {
        public MainPage()   
        {
            this.InitializeComponent();
            this.Loaded += async (s, e) => await Init();
        }

        private async Task Init() 
        {
            var settings = new app.Settings();
            if (settings.GetSetting("Settings") == null)
            {
                settings.ResetSettings();
                Frame.Navigate(typeof(Pages.LoginPage));
            }
            var token = (string)settings.GetSetting("Token");
            var server = (string)settings.GetSetting("Server");
            if (token == null || server == null)
            {
                Frame.Navigate(typeof(Pages.LoginPage));
            }
            else
            {
                if (await Admin.Login(server, token))
                {
                    gleb.Text = "Successfull login lol";
                }
            }
        }
    }
}
