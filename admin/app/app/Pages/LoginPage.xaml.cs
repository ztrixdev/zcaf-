using System;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using app.Handlers;
using System.Threading.Tasks;
using Microsoft.UI;
using Microsoft.UI.Xaml.Navigation;

namespace app.Pages
{
    public sealed partial class LoginPage : Page
    {
        public LoginPage()
        {
            this.InitializeComponent();
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            if (e.Parameter is string and "Bad Credentials")
            {
                var resourceLoader = new Microsoft.Windows.ApplicationModel.Resources.ResourceLoader();
                StatusBox.Visibility = Visibility.Visible;
                StatusText.Visibility = Visibility.Visible;

                StatusBox.BorderBrush = new SolidColorBrush(Colors.Red);
                StatusBox.Background = new SolidColorBrush(Colors.Red);
                StatusText.Text = resourceLoader.GetString("Login_400");
            }

            base.OnNavigatedTo(e);
        }

        private async void Login_Click(object sender, RoutedEventArgs e)
        {
            StatusBox.Visibility = Visibility.Collapsed;
            StatusText.Visibility = Visibility.Collapsed;

            var uri = Server_Input.Text;
            var token = Token_Input.Text;

            var resourceLoader = new Microsoft.Windows.ApplicationModel.Resources.ResourceLoader();
            if (await Admin.Login(uri, token))
            {
                StatusBox.Visibility = Visibility.Visible;
                StatusText.Visibility = Visibility.Visible;

                StatusBox.BorderBrush = new SolidColorBrush(Colors.Green);
                StatusBox.Background = new SolidColorBrush(Colors.Green);
                StatusBox.Height = 30;
                StatusText.Text = resourceLoader.GetString("Login_200");

                var settings = new Settings();
                settings.SaveSetting("Token", token);
                settings.SaveSetting("Server", Server.FilterURI(uri));

                await Task.Delay(3000);
                Frame.Navigate(typeof(MainPage));
            }
            else
            {
                StatusBox.Visibility = Visibility.Visible;
                StatusText.Visibility = Visibility.Visible;

                StatusBox.BorderBrush = new SolidColorBrush(Colors.Red);
                StatusBox.Background = new SolidColorBrush(Colors.Red);
                StatusText.Text = resourceLoader.GetString("Login_400");
            }
        }
    }
}
