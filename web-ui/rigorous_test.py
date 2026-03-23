import httpx
import time
import random
import string

BASE_URL = "http://localhost:8000"

def generate_random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase, k=length))

def run_tests():
    print("Starting Rigorous Backend Tests...")
    print("-" * 50)
    
    # 1. Health Check
    print("[1] Testing Health Check...")
    try:
        r = httpx.get(f"{BASE_URL}/health")
        if r.status_code == 200:
            print("✅ Health Check Passed")
        else:
            print(f"❌ Health Check Failed: {r.status_code}")
            return
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        return

    # 2. Registration
    print("\n[2] Testing Registration...")
    email = f"test_{generate_random_string()}@example.com"
    password = "password123"
    payload = {
        "name": "Test User",
        "email": email,
        "phone": "1234567890",
        "practice": "Test Clinic",
        "password": password
    }
    
    try:
        r = httpx.post(f"{BASE_URL}/register", json=payload)
        if r.status_code == 200:
            data = r.json()
            token = data.get("token")
            print(f"✅ Registration Passed. User: {email}")
        else:
            print(f"❌ Registration Failed: {r.text}")
            return
    except Exception as e:
        print(f"❌ Registration Error: {e}")
        return

    # 3. Login
    print("\n[3] Testing Login...")
    login_payload = {"email": email, "password": password}
    try:
        r = httpx.post(f"{BASE_URL}/login", json=login_payload)
        if r.status_code == 200:
            data = r.json()
            token = data.get("token") # Update token just in case
            headers = {"Authorization": f"Bearer {token}"}
            print("✅ Login Passed")
        else:
            print(f"❌ Login Failed: {r.text}")
            return
    except Exception as e:
        print(f"❌ Login Error: {e}")
        return

    # 4. Profile Fetch & Update
    print("\n[4] Testing Profile Management...")
    try:
        # Fetch
        r = httpx.get(f"{BASE_URL}/user", headers=headers)
        if r.status_code == 200:
            print("✅ Fetch Profile Passed")
        else:
            print(f"❌ Fetch Profile Failed: {r.text}")
        
        # Update
        new_name = "Updated Test User"
        update_payload = {
            "name": new_name,
            "email": email,
            "phone": "9876543210",
            "practice_name": "Updated Clinic",
            "bio": "Test Bio",
            "specialty": "Tester"
        }
        r = httpx.put(f"{BASE_URL}/user", json=update_payload, headers=headers)
        if r.status_code == 200:
            print("✅ Update Profile Passed")
            
            # Verify
            r = httpx.get(f"{BASE_URL}/user", headers=headers)
            if r.json().get("name") == new_name:
                 print("✅ Profile Persistence Verified")
            else:
                 print("❌ Profile Persistence Failed")
        else:
            print(f"❌ Update Profile Failed: {r.text}")

    except Exception as e:
        print(f"❌ Profile Error: {e}")

    # 5. Case Creation
    print("\n[5] Testing Case Creation...")
    try:
        case_payload = {
            "fname": "Patient",
            "lname": "Zero",
            "patient_age": 30,
            "tooth_number": "19",
            "complaint": "Pain",
            "case_type": "Single Implant",
            "details": "Test Case"
        }
        r = httpx.post(f"{BASE_URL}/cases", json=case_payload, headers=headers)
        if r.status_code == 200:
            case_data = r.json()
            case_id = case_data.get("case_id")
            print(f"✅ Case Creation Passed. Case ID: {case_id}")
            
            # Verify Listing
            r = httpx.get(f"{BASE_URL}/cases", headers=headers)
            cases = r.json()
            found = any(c['case_id'] == case_id for c in cases)
            if found:
                print("✅ Case Listing Verified")
            else:
                print("❌ Case not found in listing")
        else:
            print(f"❌ Case Creation Failed: {r.text}")
            
    except Exception as e:
        print(f"❌ Case Error: {e}")

    print("-" * 50)
    print("Tests Completed.")

if __name__ == "__main__":
    run_tests()
