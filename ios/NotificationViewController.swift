// ios/NotificationViewController.swift
import UserNotifications
import UserNotificationsUI

class NotificationViewController: UIViewController, UNNotificationContentExtension {
  @IBOutlet var label: UILabel?
  
  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = UIColor(red: 1.00, green: 0.95, blue: 0.89, alpha: 1.00) // #FFF9F2
  }
  
  func didReceive(_ notification: UNNotification) {
    label?.text = notification.request.content.body
  }
}