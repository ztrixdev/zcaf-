using Windows.Storage;

namespace app
{
    class Settings
    {
        private ApplicationDataContainer _settings = Windows.Storage.ApplicationData.Current.LocalSettings;
        
        public object GetSetting(string key)
        {
            return _settings.Values[key];
        }

        public void SaveSetting(string key, object value)
        {
            _settings.Values[key] = value;
        }

        public void ResetSettings()
        {
            _settings.Values["Settings"] = "Generated";
            _settings.Values["Theme"] = "light";
            _settings.Values["Token"] = null;
            _settings.Values["Server"] = null;
            _settings.Values["Role"] = null;
            _settings.Values["CurrentCulture"] = "en";
        }
    }
}
