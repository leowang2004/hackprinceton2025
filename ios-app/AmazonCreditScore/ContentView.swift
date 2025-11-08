import SwiftUI

struct ContentView: View {
    @State private var showingLogin = true
    @State private var creditScore: Int? = nil
    @State private var isLoading = false
    
    var body: some View {
        NavigationView {
            if showingLogin {
                LoginView(
                    onLoginSuccess: { score in
                        creditScore = score
                        showingLogin = false
                    }
                )
            } else {
                CreditScoreView(score: creditScore ?? 0)
            }
        }
    }
}

struct CreditScoreView: View {
    let score: Int
    
    var body: some View {
        VStack(spacing: 30) {
            Text("Your Alternative Credit Score")
                .font(.title)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
                .padding()
            
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.3), lineWidth: 20)
                    .frame(width: 200, height: 200)
                
                Circle()
                    .trim(from: 0, to: CGFloat(score) / 850.0)
                    .stroke(
                        LinearGradient(
                            gradient: Gradient(colors: [.blue, .green]),
                            startPoint: .leading,
                            endPoint: .trailing
                        ),
                        style: StrokeStyle(lineWidth: 20, lineCap: .round)
                    )
                    .frame(width: 200, height: 200)
                    .rotationEffect(.degrees(-90))
                
                VStack {
                    Text("\(score)")
                        .font(.system(size: 60, weight: .bold))
                    Text("out of 850")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            
            Text("Based on your Amazon transaction history")
                .font(.subheadline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Spacer()
        }
        .padding()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
