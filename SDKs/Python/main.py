from suauth import Client
from datetime import datetime, timedelta

def format_expiration(expires_at):
    if not expires_at:
        return "Never"
    
    try:
        expires = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        now = datetime.now(expires.tzinfo)
        
        if now > expires:
            return f"Expired on {expires.strftime('%Y-%m-%d %H:%M:%S')}"
        
        remaining = expires - now
        days = remaining.days
        hours, remainder = divmod(remaining.seconds, 3600)
        minutes, _ = divmod(remainder, 60)
        
        if days > 0:
            return f"Expires in {days} days, {hours} hours ({expires.strftime('%Y-%m-%d %H:%M:%S')})"
        elif hours > 0:
            return f"Expires in {hours} hours, {minutes} minutes"
        else:
            return f"Expires in {minutes} minutes"
    except:
        return "Unknown"

def main():
    client = Client(
        owner_id="68a73ab4127fbc8d4d9c51aa",
        app_id="68a74291127fbc8d4d9c51ab",
        app_name="Test",
        version="1.0.0",
        base_url="http://localhost:3000"  # update this to your server URL
    )    
    while True:
        license_key = input("enter ur license key (or 'q' to quit): ").strip()
        
        if license_key.lower() == 'q':
            break
            
        if not license_key:
            print("pls enter a valid license key.\n")
            continue
                    
        try:
            result = client.validate_key(license_key)
            
            if result.get('expired'):
                print("\n❌ License has expired!")
                print(f"Reason: {result.get('message', 'Unknown error')}")
            elif result['success']:
                license = result.get('license', {})
                print("\n  License is valid!")
                print(f"Key: {license.get('key', 'N/A')}")
                print(f"Status: {license.get('status', 'N/A')}")
                print(f"Expiration: {format_expiration(license.get('expires_at'))}")
                print(f"HWID Limit: {license.get('hwid_limit', 1)}")
                
                hwids = license.get('hwids', [])
                if hwids:
                    print("\nRegistered Devices:")
                    for i, hwid in enumerate(hwids, 1):
                        print(f"  {i}. {hwid}")
            else:
                print(f"\nvalidation failed: {result.get('message', 'Unknown error')}")
                
        except Exception as e:
            print(f"\nan error occurred: {str(e)}")
            
        print("\n" + "="*50 + "\n")

if __name__ == "__main__":
    main()
