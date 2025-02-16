#include "pch.h"
#include "MainWindow.xaml.h"
#include <winrt/Windows.Storage.h>
#include <winrt/Windows.Foundation.h>

#include "sets/settings.h"

#if __has_include("MainWindow.g.cpp")
#include "MainWindow.g.cpp"
#endif

using namespace winrt;
using namespace Windows::Storage;
using namespace Microsoft::UI::Xaml;

// To learn more about WinUI, the WinUI project structure,
// and more about our project templates, see: http://aka.ms/winui-project-info.

namespace winrt::app::implementation
{
    int32_t MainWindow::MyProperty()
    {
        throw hresult_not_implemented();
    }

    void MainWindow::MyProperty(int32_t /* value */)
    {
        throw hresult_not_implemented();
    }


    void MainWindow::myButton_Click(IInspectable const&, RoutedEventArgs const&)
    {
        return;
    }
}
